package pay

import (
	"github.com/gin-gonic/gin"
)

func Register(app *gin.RouterGroup) {
	app.POST("/pay/orderToPay", OrderToPay)
	app.POST("/pay/modifyPayStatus", ModifyPayStatus)
	app.POST("/pay/order", Order)
	app.GET("/pay/payStatus", PayStatus)
}
