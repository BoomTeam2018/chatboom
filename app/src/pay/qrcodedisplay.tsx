import QRCode from 'qrcode.react';
import '@/assets/pay/qrcodedisplay.less';

const QRCodeDisplay = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const quota = searchParams.get('quota');
    const username = searchParams.get('username');
    const qrCode = searchParams.get('qrCode');
    console.log("Quota:", quota);
    console.log("Username:", username);
    console.log("QrCode:", qrCode);
    return (
        <div className="qr-code-container">
            <h1>支付宝扫码支付</h1>
            <div className="qr-code-center">
                {qrCode && (
                    <QRCode
                        value={qrCode}
                        size={256}
                        level={'L'}
                    />
                )}
            </div>
        </div>
    );
};

export default QRCodeDisplay;
