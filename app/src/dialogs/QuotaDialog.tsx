import {useDispatch, useSelector} from 'react-redux';
import {
    closeDialog,
    dialogSelector,
    refreshQuota,
    setDialog
} from '@/store/quota.ts';
import {
    dialogSelector as subDialogSelector,
    openDialog as openSubDialog
} from '@/store/subscription.ts';
import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog.tsx';
import '@/assets/pages/quota.less';
import {Cloud, Plus} from 'lucide-react';
import {Input} from '@/components/ui/input.tsx';
import {testNumberInputEvent} from '@/utils/dom.ts';
import {Button} from '@/components/ui/button.tsx';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog.tsx';
import {AlertDialogTitle} from '@radix-ui/react-alert-dialog';
import {orderToPay, payStatus} from '@/api/addition.ts';
import {useToast} from '@/components/ui/use-toast.ts';
import {useEffectAsync} from '@/utils/hook.ts';
import {selectAuthenticated, selectUsername} from '@/store/auth.ts';
import {ToastAction} from '@/components/ui/toast.tsx';
import {buyLink, deeptrainEndpoint, useDeeptrain} from '@/conf/env.ts';
import {useRedeem} from '@/api/redeem.ts';
import {cn} from '@/components/ui/lib/utils.ts';
import {subscriptionDataSelector} from '@/store/globals.ts';
import {openWindow} from '@/utils/device.ts';

type AmountComponentProps = {
    amount: number;
    active?: boolean;
    other?: boolean;
    onClick?: () => void;
};

function generateUniqueId(): string {
    // 获取当前时间的毫秒数
    const timestamp = Date.now().toString(36);
    // 生成一个随机数
    const random = Math.random().toString(36).substring(2, 8);
    // 可以添加其他唯一标识符，如用户ID，这里省略以保持简单
    // 拼接并返回
    return `${timestamp}-${random}`;
}

function AmountComponent({
                             amount,
                             active,
                             other,
                             onClick
                         }: AmountComponentProps) {
    const {t} = useTranslation();

    return (
        <div className={cn('amount', active && 'active')} onClick={onClick}>
            {!other ? (
                <>
                    <div className={`amount-title`}>
                        <Cloud className={`h-4 w-4`}/>
                        {amount.toFixed(0)}
                    </div>
                    <div className={`amount-desc`}>{amount.toFixed(2)}</div>
                </>
            ) : (
                <div className={`other`}>{t('buy.other')}</div>
            )}
        </div>
    );
}

let pollingIntervalId: NodeJS.Timeout;

// 开始轮询支付状态
function startPaymentStatusPolling(bizNum: string | undefined, onPaymentSuccess: {
    (successResponse: any): void;
    (arg0: { status: boolean; error: string; }): void;
}, onPaymentFailure: { (failureError: any): void; (arg0: unknown): void; }) {
    // 清除任何现有的轮询
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
    }

    // 定义轮询函数
    const pollPaymentStatus = async () => {
        try {
            const res = await payStatus(bizNum);
            if (res.status) {
                // 支付成功，停止轮询
                clearInterval(pollingIntervalId);
                onPaymentSuccess(res);
            } else {
                onPaymentFailure(res.error);
                clearInterval(pollingIntervalId);
            }
        } catch (error) {
            // 处理错误，可以选择在这里停止轮询或继续尝试
            console.error('Error checking payment status:', error);
            onPaymentFailure(error);
            clearInterval(pollingIntervalId);
        }
    };

    // 设置轮询间隔为3秒
    pollingIntervalId = setInterval(pollPaymentStatus, 3000);

    // 在5分钟后停止轮询
    setTimeout(() => {
        clearInterval(pollingIntervalId);
    }, 5 * 60 * 1000);
}

function QuotaDialog() {
    const {t} = useTranslation();
    const {toast} = useToast();
    const [current, setCurrent] = useState(1);
    const [amount, setAmount] = useState(10);
    const open = useSelector(dialogSelector);
    const auth = useSelector(selectAuthenticated);
    const username = useSelector(selectUsername);
    let bizNUm: string | undefined = "";
    const sub = useSelector(subDialogSelector);
    const subscriptionData = useSelector(subscriptionDataSelector);

    const [redeem, setRedeem] = useState('');

    const dispatch = useDispatch();
    useEffectAsync(async () => {
        if (!auth) return;
        await refreshQuota();
    }, [auth]);

    return (
        <Dialog
            open={open}
            onOpenChange={(state: boolean) => dispatch(setDialog(state))}
        >
            <DialogContent className={`quota-dialog flex-dialog`}>
                <DialogHeader>
                    <DialogTitle>{t('buy.choose')}</DialogTitle>
                    <DialogDescription asChild>
                        <div className={`dialog-wrapper`}>
                            {subscriptionData.length > 0 && (
                                <p
                                    className={`link translate-y-2 text-center`}
                                    onClick={() =>
                                        sub
                                            ? dispatch(closeDialog())
                                            : dispatch(openSubDialog())
                                    }
                                >
                                    {t('sub.subscription-link')}
                                </p>
                            )}
                            <div className={`buy-interface`}>
                                <div className={`interface-item`}>
                                    <div className={`amount-container`}>
                                        <div className={`amount-wrapper`}>
                                            <AmountComponent
                                                amount={5}
                                                active={current === 1}
                                                onClick={() => {
                                                    setCurrent(1);
                                                    setAmount(5);
                                                }}
                                            />
                                            <AmountComponent
                                                amount={25}
                                                active={current === 2}
                                                onClick={() => {
                                                    setCurrent(2);
                                                    setAmount(25);
                                                }}
                                            />
                                            <AmountComponent
                                                amount={50}
                                                active={current === 3}
                                                onClick={() => {
                                                    setCurrent(3);
                                                    setAmount(50);
                                                }}
                                            />
                                            <AmountComponent
                                                amount={100}
                                                active={current === 4}
                                                onClick={() => {
                                                    setCurrent(4);
                                                    setAmount(100);
                                                }}
                                            />
                                            <AmountComponent
                                                amount={200}
                                                active={current === 5}
                                                onClick={() => {
                                                    setCurrent(5);
                                                    setAmount(200);
                                                }}
                                            />
                                            <AmountComponent
                                                amount={NaN}
                                                other={true}
                                                active={current === 6}
                                                onClick={() => setCurrent(6)}
                                            />
                                        </div>
                                        {current === 6 && (
                                            <div className={`other-wrapper`}>
                                                <div
                                                    className={`amount-input-box`}
                                                >
                                                    <Cloud
                                                        className={`h-4 w-4`}
                                                    />
                                                    <Input
                                                        className={`amount-input`}
                                                        placeholder={t(
                                                            'buy.other-desc'
                                                        )}
                                                        value={amount}
                                                        onKeyDown={e => {
                                                            if (
                                                                testNumberInputEvent(
                                                                    e
                                                                )
                                                            ) {
                                                                switch (e.key) {
                                                                    case 'ArrowUp':
                                                                        setAmount(
                                                                            amount +
                                                                            1
                                                                        );
                                                                        break;
                                                                    case 'ArrowDown':
                                                                        setAmount(
                                                                            amount -
                                                                            1
                                                                        );
                                                                        break;
                                                                }
                                                            }
                                                        }}
                                                        onChange={e => {
                                                            if (
                                                                e.target
                                                                    .value !==
                                                                ''
                                                            ) {
                                                                setAmount(
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                );
                                                                if (
                                                                    amount >
                                                                    99999
                                                                ) {
                                                                    setAmount(
                                                                        99999
                                                                    );
                                                                }
                                                            } else {
                                                                setAmount(0);
                                                            }
                                                        }}
                                                        maxLength={5}
                                                    />
                                                </div>
                                                <div
                                                    className={`amount-number`}
                                                >
                                                    {amount.toFixed(2)} CNY
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`buy-action`}>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant={`default`}
                                                    className={`buy-button`}
                                                    disabled={amount === 0}
                                                >
                                                    <Plus
                                                        className={`h-4 w-4 mr-2`}
                                                    />
                                                    {t('buy.buy', {amount})}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        {t('buy.dialog-title')}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('buy.dialog-desc', {
                                                            amount
                                                        })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        {t('buy.dialog-cancel')}
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={async () => {
                                                            if (!useDeeptrain) {
                                                                if (
                                                                    buyLink.trim()
                                                                        .length ===
                                                                    0
                                                                )
                                                                    return toast(
                                                                        {
                                                                            title: t(
                                                                                'buy.not-config-link'
                                                                            )
                                                                        }
                                                                    );
                                                                const res =
                                                                    await orderToPay(
                                                                        {
                                                                            requestId: generateUniqueId(), // 请求ID
                                                                            channelType: 1,  // 支付渠道类型
                                                                            totalAmount: amount,// 总金额
                                                                            subject: "扫码支付" // 备注
                                                                        }
                                                                    );
                                                                console.log("支付返回：" + JSON.stringify(res));
                                                                if (res.success) {
                                                                    bizNUm = res.data?.bizOrderNum
                                                                    const qrCode = res.data?.extraData.qrCode
                                                                    openWindow(
                                                                        `${buyLink}?quota=${amount}&username=${username}&qrCode=${qrCode}`,
                                                                        '_blank'
                                                                    );
                                                                }
                                                            }
                                                            startPaymentStatusPolling(bizNUm,
                                                                () => {
                                                                    // 支付成功处理
                                                                    toast({
                                                                        title: t('buy.success'),
                                                                        description: t('buy.success-prompt', {amount})
                                                                    });
                                                                    dispatch(closeDialog());
                                                                },
                                                                () => {
                                                                    // 支付失败或错误处理
                                                                    toast({
                                                                        title: t('buy.failed'),
                                                                        description: `${t('buy.failed-prompt', {amount})}`,
                                                                        action: useDeeptrain ? (
                                                                            <ToastAction
                                                                                altText={t('buy.go')}
                                                                                onClick={() => location.href = `${deeptrainEndpoint}/home/wallet`}
                                                                            >
                                                                                {t('buy.go')}
                                                                            </ToastAction>
                                                                        ) : undefined
                                                                    });
                                                                    if (useDeeptrain) {
                                                                        setTimeout(() => {
                                                                            openWindow(`${deeptrainEndpoint}/home/wallet`);
                                                                        }, 2000);
                                                                    }
                                                                }
                                                            );
                                                        }}
                                                    >
                                                        {t('buy.dialog-buy')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    {useDeeptrain ? (
                                        <div
                                            className={`flex flex-row w-full justify-center items-center mt-2 select-none`}
                                        >
                                            {t('buy.deeptrain-tip')}
                                        </div>
                                    ) : (
                                        <div className={`flex flex-row w-full`}>
                                            <Input
                                                className={`redeem-input mr-2 text-center`}
                                                placeholder={t(
                                                    'buy.redeem-placeholder'
                                                )}
                                                value={redeem}
                                                onChange={e =>
                                                    setRedeem(e.target.value)
                                                }
                                            />
                                            <Button
                                                loading={true}
                                                className={`whitespace-nowrap`}
                                                onClick={async () => {
                                                    if (redeem.trim() === '')
                                                        return;
                                                    const res = await useRedeem(
                                                        redeem.trim()
                                                    );
                                                    if (res.status) {
                                                        toast({
                                                            title: t(
                                                                'buy.exchange-success'
                                                            ),
                                                            description: t(
                                                                'buy.exchange-success-prompt',
                                                                {
                                                                    amount: res.quota
                                                                }
                                                            )
                                                        });
                                                        setRedeem('');
                                                        await refreshQuota();
                                                    } else {
                                                        toast({
                                                            title: t(
                                                                'buy.exchange-failed'
                                                            ),
                                                            description: t(
                                                                'buy.exchange-failed-prompt',
                                                                {
                                                                    reason: res.error
                                                                }
                                                            )
                                                        });
                                                    }
                                                }}
                                            >
                                                {t('buy.redeem')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/*<div*/}
                            {/*    className={`tip flex-row items-center justify-center mt-4 mb-4`}*/}
                            {/*>*/}
                            {/*    {buyLink && buyLink.length > 0 && (*/}
                            {/*        <Button asChild>*/}
                            {/*            <a href={buyLink} target={`_blank`}>*/}
                            {/*                <ExternalLink*/}
                            {/*                    className={`h-4 w-4 mr-2`}*/}
                            {/*                />*/}
                            {/*                {t('buy.buy-link')}*/}
                            {/*            </a>*/}
                            {/*        </Button>*/}
                            {/*    )}*/}
                            {/*</div>*/}
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

export default QuotaDialog;
