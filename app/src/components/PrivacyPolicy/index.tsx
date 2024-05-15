import './index.less';
import { useTranslation } from 'react-i18next';

interface Props {
    setHasAgreed: (a: boolean) => void;
}
export const PrivacyPolicy = ({ setHasAgreed }: Props) => {
    const { t } = useTranslation();

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
                        {t("hasAgreed")}
                        <a
                            href="https://biunova.com/privacy.pdf"
                            target="_blank"
                        >
                            {t("privacy-policy")}
                        </a>
                        、
                        <a
                            href="https://biunova.com/protocal.pdf"
                            target="_blank"
                        >
                            {t("user-agreement")}
                        </a>
                    </p>
                </div>
            </label>
        </div>
    );
};
