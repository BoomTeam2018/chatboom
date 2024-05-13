import './index.less';

interface Props {
    setHasAgreed: (a: boolean) => void;
}
export const PrivacyPolicy = ({ setHasAgreed }: Props) => {
    return (
        <div className="fm-agreement">
            <input
                type="checkbox"
                className="fm-agreement-checkbox"
                value="on"
                onChange={e => {
                    setHasAgreed(e.target.checked);
                }}
            />
            <label className="fm-agreement-text">
                <div>
                    <p>
                        已阅读并同意以下协议
                        <a
                            href="http://43.139.166.43/privacy.pdf"
                            target="_blank"
                        >
                            隐私权政策
                        </a>
                        、
                        <a
                            href="http://43.139.166.43/protocal.pdf"
                            target="_blank"
                        >
                            用户服务协议
                        </a>
                    </p>
                </div>
            </label>
        </div>
    );
};
