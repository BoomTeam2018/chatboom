package manager

import (
	"bytes"
	"chat/auth"
	"chat/globals"
	"chat/manager/conversation"
	"chat/utils"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
)

const warningCN = "您的消息可能违反了我们的内容政策，请确保消息合规！"

type WebsocketAuthForm struct {
	Token string `json:"token" binding:"required"`
	Id    int64  `json:"id" binding:"required"`
	Ref   string `json:"ref"`
}

func ParseAuth(c *gin.Context, token string) *auth.User {
	token = strings.TrimSpace(token)
	if token == "" {
		return nil
	}

	if strings.HasPrefix(token, "Bearer ") {
		token = token[7:]
	}

	if strings.HasPrefix(token, "sk-") {
		return auth.ParseApiKey(c, token)
	}

	return auth.ParseToken(c, token)
}

func splitMessage(message string) (int, string, error) {
	parts := strings.SplitN(message, ":", 2)
	if len(parts) == 2 {
		if id, err := strconv.Atoi(parts[0]); err == nil {
			return id, parts[1], nil
		}
	}

	return 0, message, fmt.Errorf("message type error")
}

func getId(message string) (int, error) {
	if id, err := strconv.Atoi(message); err == nil {
		return id, nil
	}

	return 0, fmt.Errorf("message type error")
}

func ChatAPI(c *gin.Context) {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocket(c, false); conn == nil {
		return
	}
	defer conn.DeferClose()

	db := utils.GetDBFromContext(c)

	form, err := utils.ReadForm[WebsocketAuthForm](conn)
	if err != nil {
		return
	}

	user := ParseAuth(c, form.Token)
	authenticated := user != nil

	id := auth.GetId(db, user)

	instance := conversation.ExtractConversation(db, user, form.Id, form.Ref)
	hash := fmt.Sprintf(":chatthread:%s", utils.Md5Encrypt(utils.Multi(
		authenticated,
		strconv.FormatInt(id, 10),
		c.ClientIP(),
	)))

	buf := NewConnection(conn, authenticated, hash, 10)
	buf.Handle(func(form *conversation.FormMessage) error {

		switch form.Type {
		case ChatType:
			sensitive := checkSensitive(form.Message)
			if sensitive {
				buf.Send(
					globals.ChatSegmentResponse{
						Message: warningCN,
						End:     true,
					})
			} else {
				if instance.HandleMessage(db, form) {
					response := ChatHandler(buf, user, instance, false)
					instance.SaveResponse(db, response)
				}
			}
		case StopType:
			break
		case ShareType:
			instance.LoadSharing(db, form.Message)
		case RestartType:
			// reset the params if set
			instance.ApplyParam(form)

			response := ChatHandler(buf, user, instance, true)
			instance.SaveResponse(db, response)
		case MaskType:
			instance.LoadMask(form.Message)
		case EditType:
			if id, message, err := splitMessage(form.Message); err == nil {
				instance.EditMessage(id, message)
				instance.SaveConversation(db)
			} else {
				return err
			}
		case RemoveType:
			id, err := getId(form.Message)
			if err != nil {
				return err
			}

			instance.RemoveMessage(id)
			instance.SaveConversation(db)
		}

		return nil
	})
}

func checkSensitive(message string) bool {
	endpoint := viper.GetString("system.general.sensitiveendpoint")
	if endpoint == "" {
		return false
	}
	url := fmt.Sprintf("%s/api/sensitive/check", endpoint)
	requestData := globals.SensitiveRequest{
		Content: message,
	}
	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return false
	}
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false
	}
	var isSensitive bool
	err = json.Unmarshal(body, &isSensitive)
	if err != nil {
		return false
	}
	return isSensitive
}

//func replaceSensitiveWord(message string) string {
//	endpoint := viper.GetString("system.general.sensitiveendpoint")
//	if endpoint == "" {
//		return message
//	}
//
//	url := fmt.Sprintf("%s/api/sensitive/replaceWith", endpoint)
//	requestData := globals.SensitiveRequest{
//		Content: message,
//	}
//
//	jsonData, err := json.Marshal(requestData)
//	if err != nil {
//		return message
//	}
//
//	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
//	if err != nil {
//		return message
//	}
//	defer resp.Body.Close()
//
//	body, err := ioutil.ReadAll(resp.Body)
//	if err != nil {
//		return message
//	}
//
//	var replacedMessage globals.ReplacedMessage
//	err = json.Unmarshal(body, &replacedMessage)
//	if err != nil {
//		return message
//	}
//
//	return replacedMessage.Message
//}
