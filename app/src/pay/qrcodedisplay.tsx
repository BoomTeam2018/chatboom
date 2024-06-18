import {useParams} from 'react-router-dom';
import QRCode from 'qrcode.react';
import '@/assets/pay/qrcodedisplay.less';
const QRCodeDisplay = () => {
    // 使用useParams hook获取路由参数
    const urlParam = useParams();

    // 解码URL参数，因为路由中的参数会被自动编码
    // @ts-ignore
    const decodedUrl = decodeURIComponent(urlParam);
    return (
        <div className="qr-code-container">
            <h1>支付宝扫码支付</h1>
            <div className="qr-code-center">
                {decodedUrl && (
                    <QRCode
                        value={decodedUrl}
                        size={256}
                        level={'L'}
                    />
                )}
            </div>
        </div>
    );
};

export default QRCodeDisplay;
