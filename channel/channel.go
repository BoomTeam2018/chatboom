package channel

import (
	"chat/connection"
	"chat/globals"
	"chat/utils"
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"sync"
	"time"
)

var defaultMaxRetries = 1
var defaultReplacer = []string{
	"openai_api", "anthropic_api",
	"api2d", "closeai_api",
	"one_api", "new_api", "shell_api",
}

func (c *Channel) GetId() int {
	return c.Id
}

func (c *Channel) GetName() string {
	return c.Name
}

func (c *Channel) GetType() string {
	return c.Type
}

func (c *Channel) GetPriority() int {
	return c.Priority
}

func (c *Channel) GetWeight() int {
	if c.Weight <= 0 {
		return 1
	}
	return c.Weight
}

func (c *Channel) GetModels() []string {
	return c.Models
}

func (c *Channel) GetRetry() int {
	if c.Retry <= 0 {
		return defaultMaxRetries
	}
	return c.Retry
}

func (c *Channel) GetSecret() string {
	return c.Secret
}

func (c *Channel) GetCurrentSecret() *string {
	return c.CurrentSecret
}

// GetRandomSecret returns a random secret from the secret list
func (c *Channel) GetRandomSecret() string {
	arr := strings.Split(c.GetSecret(), "\n")
	if len(arr) == 0 {
		return ""
	}

	idx := utils.Intn(len(arr))
	secret := arr[idx]

	c.CurrentSecret = &secret
	return secret
}

func (c *Channel) SplitRandomSecret(num int) []string {
	secret := c.GetRandomSecret()
	arr := strings.Split(secret, "|")
	if len(arr) == num {
		return arr
	} else if len(arr) > num {
		return arr[:num]
	}

	for i := len(arr); i < num; i++ {
		arr = append(arr, "")
	}

	return arr
}

func (c *Channel) GetEndpoint() string {
	return c.Endpoint
}

func (c *Channel) GetDomain() string {
	if instance, err := url.Parse(c.GetEndpoint()); err == nil {
		return instance.Host
	}

	return c.GetEndpoint()
}

func (c *Channel) GetMapper() string {
	return c.Mapper
}

func (c *Channel) Load() {
	reflect := make(map[string]string)
	exclude := make([]string, 0)
	models := c.GetModels()

	arr := strings.Split(c.GetMapper(), "\n")
	for _, item := range arr {
		pair := strings.Split(item, ">")
		if len(pair) != 2 {
			continue
		}

		from, to := pair[0], pair[1]
		if strings.HasPrefix(from, "!") {
			from = strings.TrimPrefix(from, "!")
			exclude = append(exclude, to)
		}

		reflect[from] = to
	}

	c.Reflect = &reflect
	c.ExcludeModels = &exclude

	var hits []string

	for _, model := range models {
		if !utils.Contains(model, hits) && !utils.Contains(model, exclude) {
			hits = append(hits, model)
		}
	}

	for model := range reflect {
		if !utils.Contains(model, hits) && !utils.Contains(model, exclude) {
			hits = append(hits, model)
		}
	}

	c.HitModels = &hits
}

func (c *Channel) GetReflect() map[string]string {
	return *c.Reflect
}

func (c *Channel) GetExcludeModels() []string {
	return *c.ExcludeModels
}

// GetModelReflect returns the reflection model name if it exists, otherwise returns the original model name
func (c *Channel) GetModelReflect(model string) string {
	ref := c.GetReflect()
	if reflect, ok := ref[model]; ok && len(reflect) > 0 {
		return reflect
	}

	return model
}

func (c *Channel) GetHitModels() []string {
	return *c.HitModels
}

func (c *Channel) GetState() bool {
	return c.State
}

func (c *Channel) GetGroup() []string {
	return c.Group
}

func (c *Channel) GetProxy() globals.ProxyConfig {
	redisKey := fmt.Sprintf("channel:%d:requests", c.GetId())
	ctx := context.Background()

	count, err := connection.Cache.Incr(ctx, redisKey).Result()
	if err != nil {
		globals.Error(fmt.Sprintf("Failed to increase request count: %s", err))
		return c.Proxy // 返回当前代理配置，或处理错误更优雅
	}
	if count == 1 {
		connection.Cache.Expire(ctx, redisKey, 10*time.Second) // 设置10秒过期时间
	}

	if count > 10 {
		c.Proxy = getNewProxy()
		connection.Cache.Set(ctx, redisKey, 0, 10*time.Second)
	}

	return c.Proxy
}

func (c *Channel) IsHitGroup(group string) bool {
	if len(c.GetGroup()) == 0 {
		return true
	}

	return utils.Contains(group, c.GetGroup())
}

func (c *Channel) IsHit(model string) bool {
	return utils.Contains(model, c.GetHitModels())
}

func (c *Channel) ProcessError(err error) error {
	if err == nil {
		return nil
	}
	content := err.Error()

	if strings.Contains(content, c.GetEndpoint()) {
		// hide the endpoint
		replacer := fmt.Sprintf("channel://%d", c.GetId())
		content = strings.Replace(content, c.GetEndpoint(), replacer, -1)
	}

	if domain := c.GetDomain(); len(strings.TrimSpace(domain)) > 0 && strings.Contains(content, domain) {
		content = strings.Replace(content, domain, "channel", -1)
	}

	for _, item := range defaultReplacer {
		content = strings.Replace(content, item, "chatboom_upstream", -1)
	}

	secret := c.GetCurrentSecret()
	if secret != nil {
		content = strings.Replace(content, *secret, utils.ToSecret(*secret), -1)
	}

	return errors.New(content)
}

var proxyConfigs []globals.ProxyConfig

func init() {
	// 在程序启动时初始化代理配置
	proxyConfigs = []globals.ProxyConfig{
		{
			ProxyType: 1,
			Proxy:     "http://127.0.0.1:10809",
			Username:  "",
			Password:  "",
		},
		{
			ProxyType: 3,
			Proxy:     "socks5://127.0.0.1:10808",
			Username:  "",
			Password:  "",
		},
	}
}

var currentIndex int = 0
var mutex sync.Mutex

func getNewProxy() globals.ProxyConfig {
	mutex.Lock()
	defer mutex.Unlock()
	proxy := proxyConfigs[currentIndex]
	currentIndex = (currentIndex + 1) % len(proxyConfigs)
	return proxy
}
