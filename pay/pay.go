package pay

import (
	"bytes"
	"chat/auth"
	"chat/utils"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
)

type PaymentRequest struct {
	// Define fields like Amount, CardNumber, etc.
	RequestId   string `json:"requestId"`   // 请求ID
	ChannelType int    `json:"channelType"` // 支付渠道类型
	TotalAmount int    `json:"totalAmount"` // 总金额
	BizOrderNum string `json:"bizOrderNum"` // 业务订单号
	Subject     string `json:"subject"`     // 备注
}

type OrderNotifyRequest struct {
	UniqueId    string
	BizOrderNum string
	OrderNum    string
	OutOrderNum string
	SuccessTime string
}

type PayOrder struct {
	// Define fields like Amount, CardNumber, etc.
	UserId      int64
	ChannelType int    // 支付渠道类型
	TotalAmount int    // 总金额
	BizOrderNum string // 业务订单号
	OrderNum    string
	OutOrderNum string
	Subject     string // 备注
	PayStatus   int    // 支付状态
	PayTime     string // 支付时间
}

// ResponseData 代表根级别的响应数据结构
type ResponseData struct {
	RequestID     string    `json:"requestId"`
	Success       bool      `json:"success"`
	Code          int       `json:"code"`
	Msg           *string   `json:"msg"`           // 使用指针类型以处理null值
	ThirdPartCode *string   `json:"thirdPartCode"` // 同上
	ThirdPartMsg  *string   `json:"thirdPartMsg"`  // 同上
	Data          OrderData `json:"data"`
}

// OrderData 代表嵌套的订单数据结构
type OrderData struct {
	BizOrderNum string    `json:"bizOrderNum"`
	OrderNum    string    `json:"orderNum"`
	OutOrderNum *string   `json:"outOrderNum"` // 外部订单号，可能为null
	JumpUrl     string    `json:"jumpUrl"`
	ExtraData   ExtraData `json:"extraData"`
}

// ExtraData 代表额外数据结构，包含二维码信息
type ExtraData struct {
	QRCode string `json:"qrCode"`
}

/**
 * 下单支付
 */
func OrderToPay(c *gin.Context) {
	//获取当前登录用户信息
	user := auth.RequireAuth(c)
	if user == nil {
		return
	}
	// 创建请求数据结构实例
	var req PaymentRequest
	// 绑定请求JSON数据
	if err := c.Bind(&req); err != nil {
		returnErrorResponse(c, http.StatusBadRequest, "Failed to parse the request body", err)
		return
	}
	// 设置业务相关属性
	req.BizOrderNum = generateUniqueBizCode()
	// 序列化请求体
	body, err := json.Marshal(req)
	if err != nil {
		returnErrorResponse(c, http.StatusInternalServerError, "Error encoding request body", err)
		return
	}
	// 发起POST请求
	resp, err := http.Post("http://localhost:8094/api/v1/pay/order", "application/json", bytes.NewBuffer(body))
	if err != nil {
		returnErrorResponse(c, http.StatusInternalServerError, "Error calling API", err)
		return
	}
	defer resp.Body.Close()
	// 读取并解码响应
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		returnErrorResponse(c, http.StatusInternalServerError, "Error reading response body", err)
		return
	}
	var responseData ResponseData
	if err := json.Unmarshal(respBody, &responseData); err != nil {
		returnErrorResponse(c, http.StatusInternalServerError, "Error decoding response body", err)
		return
	}
	// 创建并保存新订单
	db := utils.GetDBFromContext(c)
	patOrder := PayOrder{
		UserId:      user.ID,
		ChannelType: req.ChannelType,
		TotalAmount: req.TotalAmount,
		BizOrderNum: req.BizOrderNum,
		OrderNum:    "",
		OutOrderNum: "",
		Subject:     req.Subject,
		PayStatus:   0,
		PayTime:     time.Now().Format("2006-01-02 15:04:05"),
	}
	if err := IncreasePayOrder(db, &patOrder); err != nil {
		returnErrorResponse(c, http.StatusInternalServerError, "Error creating payment order", err) // 移除了err后面的点号
		return
	}
	//返回前端数据
	c.JSON(http.StatusOK, respBody)
}

/**
 * 支付回调处理逻辑
 */
func ModifyPayStatus(c *gin.Context) {
	var req OrderNotifyRequest // 创建一个 PaymentRequest 类型的变量来保存请求的数据
	// 使用 ShouldBindJSON 尝试将请求的 JSON 数据绑定到 req 变量上
	if err := c.ShouldBindJSON(&req); err != nil {
		// 如果绑定过程中发生错误（如请求体不是有效的 JSON 格式），返回错误响应
		returnErrorResponse(c, http.StatusBadRequest, "Failed to parse the request body", err)
		return
	}
	db := utils.GetDBFromContext(c)
	//更改订单状态
	UpdatePayOrder(db, 1, req.OrderNum, req.OutOrderNum, req.BizOrderNum)
}

func Order(c *gin.Context) {
	ExtraData := ExtraData{
		QRCode: "https://qr.alipay.com/bax01540lergtqvamzco30be",
	}
	OrderData := OrderData{
		BizOrderNum: "879d95e3-79d3-44ba-b723-1dc5b2930de7",
		OrderNum:    "zf12345600721101400001",
		OutOrderNum: nil,
		JumpUrl:     "https://qr.alipay.com/bax01540lergtqvamzco30be",
		ExtraData:   ExtraData,
	}
	// Example data to be returned
	response := &ResponseData{
		RequestID:     "62198654e10e4d6bb8f0987c7a2d7f43",
		Success:       true,
		Code:          0,
		Msg:           nil,
		ThirdPartCode: nil,
		ThirdPartMsg:  nil,
		Data:          OrderData,
	}
	// Return the JSON response
	c.JSON(200, response)
}

func PayStatus(c *gin.Context) {
	db := utils.GetDBFromContext(c)
	var bizNum = ""
	payOrder, err := GetPayOrder(db, bizNum)
	if err != nil {
		returnErrorResponse(c, http.StatusInternalServerError, "Error getting payment status", err)
		return
	}
	if payOrder.PayStatus == 1 {
		c.JSON(http.StatusOK, gin.H{"status": true})
	} else {
		c.JSON(http.StatusOK, gin.H{"status": false})
	}
}

// 用于生成唯一业务编码的函数
func generateUniqueBizCode() string {
	// 确保在多线程环境下生成的随机数是安全的
	var mu sync.Mutex
	mu.Lock()
	defer mu.Unlock()
	// 获取当前时间戳（精确到毫秒）
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	// 生成一个4位的随机数（0000-9999）
	randomNum := rand.Intn(10000)
	// 格式化时间戳和随机数，确保长度一致且易于阅读
	timestampStr := fmt.Sprintf("%013d", timestamp) // 假设时间戳部分为13位
	randomStr := fmt.Sprintf("%04d", randomNum)
	// 拼接时间戳和随机数作为业务编码
	bizCode := timestampStr + randomStr
	return bizCode
}

// 返回错误响应的辅助函数
func returnErrorResponse(c *gin.Context, statusCode int, message string, err error) {
	c.JSON(statusCode, gin.H{"error": message, "details": err.Error()})
	log.Printf("%s: %v", message, err) // 记录错误日志
}
