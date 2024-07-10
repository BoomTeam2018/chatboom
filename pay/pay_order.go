package pay

import (
	"chat/globals"
	"database/sql"
	"fmt"
)

/**
 * @Description: 新增订单
 */
func IncreasePayOrder(db *sql.DB, po *PayOrder) error {
	_, err := globals.ExecDb(db, `
		INSERT INTO pay_order (user_id, biz_order_num, total_amount,channel_type,orderNum,outOrderNum,subject,pay_status,pay_time
		) VALUES (?,?,?,?,?,?,?,?,?);
	`, po.UserId, po.BizOrderNum, po.TotalAmount, po.ChannelType, nil, nil,
		po.Subject, po.PayStatus, po.PayTime)
	return err
}

/**
 * @Description: 更新订单
 */
func UpdatePayOrder(db *sql.DB, s int, bizOrderNum string, orderNum string, outOrderNum string) error {
	_, err := globals.ExecDb(db, `
		update pay_order set pay_status = ?,orderNum=?,outOrderNum=?
		                 WHERE biz_order_num = ?;`, s, orderNum, outOrderNum, bizOrderNum)
	return err
}

func GetPayOrder(db *sql.DB, bizOrderNum string) (*PayOrder, error) {
	var po PayOrder
	err := db.QueryRow(`
		SELECT user_id, biz_order_num, total_amount, channel_type, pay_status, pay_time
		FROM pay_order WHERE biz_order_num = ?`,
		bizOrderNum).Scan(&po.UserId, &po.BizOrderNum, &po.TotalAmount, &po.ChannelType, &po.PayStatus, &po.PayTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("支付订单未找到: %w", err)
		}
		return nil, fmt.Errorf("获取支付订单失败: %w", err)
	}
	return &po, nil
}
