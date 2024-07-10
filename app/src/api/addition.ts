import axios from 'axios';
import {getErrorMessage} from '@/utils/base.ts';

type QuotaResponse = {
    status: boolean;
    error: string;
};

type PayStatusResponse = {
    status: boolean;
    error: string;
};

export type PayRequest = {
    requestId: string; // 请求ID
    channelType: number;  // 支付渠道类型
    totalAmount: number;// 总金额
    subject: string; // 备注
};

type PayResponse = {
    requestId: string,
    success: boolean,
    code: number,
    msg: string,
    thirdPartCode: string,
    thirdPartMsg: string,
    data?: OrderRespone
};

type OrderRespone = {
    bizOrderNum: string,    // 业务订单号
    orderNum: string,
    outOrderNum: string,
    jumpUrl: string,
    extraData: ExtraData
};

type ExtraData = {
    qrCode: string,// 二维码, 用工具将其转换为二维码,让用户用支付宝扫码即可
}

type PackageResponse = {
    status: boolean;
    cert: boolean;
    teenager: boolean;
};

type SubscriptionResponse = {
    status: boolean;
    is_subscribed: boolean;
    expired: number;
    enterprise?: boolean;
    usage: Record<string, number>;
    level: number;
};

type BuySubscriptionResponse = {
    status: boolean;
    error: string;
};

type ApiKeyResponse = {
    status: boolean;
    key: string;
};

type ResetApiKeyResponse = {
    status: boolean;
    key: string;
    error: string;
};

export async function buyQuota(quota: number): Promise<QuotaResponse> {
    try {
        const resp = await axios.post(`/buy`, {quota});
        return resp.data as QuotaResponse;
    } catch (e) {
        console.debug(e);
        return {status: false, error: 'network error'};
    }
}

export async function orderToPay(paymentRequest: PayRequest): Promise<PayResponse> {
    try {
        const resp = await axios.post(`/pay/orderToPay`, paymentRequest);
        return JSON.parse(decodeBase64(resp.data)) as PayResponse;
    } catch (e) {
        console.debug(e);
        return {
            data: undefined,
            code: 0,
            requestId: "",
            thirdPartCode: "",
            thirdPartMsg: "",
            success: false,
            msg: 'network error'
        };
    }
}

export async function payStatus(bizNum: string | undefined): Promise<PayStatusResponse> {
    try {
        const resp = await axios.post(`/pay/payStatus?bizNum=${bizNum}`, {bizNum});
        return resp.data as PayStatusResponse;
    } catch (e) {
        console.debug(e);
        return {status: false, error: 'network error'};
    }
}

export async function getPackage(): Promise<PackageResponse> {
    try {
        const resp = await axios.get(`/package`);
        if (resp.data.status === false) {
            return {status: false, cert: false, teenager: false};
        }
        return {
            status: resp.data.status,
            cert: resp.data.data.cert,
            teenager: resp.data.data.teenager
        };
    } catch (e) {
        console.debug(e);
        return {status: false, cert: false, teenager: false};
    }
}

export async function getSubscription(): Promise<SubscriptionResponse> {
    try {
        const resp = await axios.get(`/subscription`);
        if (resp.data.status === false) {
            return {
                status: false,
                is_subscribed: false,
                level: 0,
                expired: 0,
                usage: {}
            };
        }
        return resp.data as SubscriptionResponse;
    } catch (e) {
        console.debug(e);
        return {
            status: false,
            is_subscribed: false,
            level: 0,
            expired: 0,
            usage: {}
        };
    }
}

export async function buySubscription(
    month: number,
    level: number
): Promise<BuySubscriptionResponse> {
    try {
        const resp = await axios.post(`/subscribe`, {level, month});
        return resp.data as BuySubscriptionResponse;
    } catch (e) {
        console.debug(e);
        return {status: false, error: 'network error'};
    }
}

export async function getKey(): Promise<ApiKeyResponse> {
    try {
        const resp = await axios.get(`/apikey`);
        if (resp.data.status === false) {
            return {status: false, key: ''};
        }
        return {
            status: resp.data.status,
            key: resp.data.key
        };
    } catch (e) {
        console.debug(e);
        return {status: false, key: ''};
    }
}

export async function regenerateKey(): Promise<ResetApiKeyResponse> {
    try {
        const resp = await axios.post(`/resetkey`);
        return resp.data as ResetApiKeyResponse;
    } catch (e) {
        console.debug(e);
        return {status: false, key: '', error: getErrorMessage(e)};
    }
}


function decodeBase64(base64String: string): string {
    try {
        // 使用atob函数解码Base64字符串
        return atob(base64String);
    } catch (error) {
        // 处理解码错误，例如输入不是有效的Base64字符串
        console.error('Error decoding Base64:', error);
        throw error;
    }
}