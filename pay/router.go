package pay

import (
	"github.com/gin-gonic/gin"
)

func Register(app *gin.RouterGroup) {
	app.POST("/v1/pay/orderToPay", OrderToPay)
	app.POST("/v1/pay/modifyPayStatus", ModifyPayStatus)
	app.POST("/v1/pay/order", Order)
	app.POST("/v1/pay/payStatus", PayStatus)
}
