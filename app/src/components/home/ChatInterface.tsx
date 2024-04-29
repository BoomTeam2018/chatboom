import React, {
    ForwardedRef,
    MutableRefObject,
    useEffect,
    useState
} from 'react';
import { Message } from '@/api/types.tsx';
import { useSelector } from 'react-redux';
import {
    listenMessageEvent,
    selectCurrent,
    useMessages
} from '@/store/chat.ts';
import MessageSegment from '@/components/Message.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ArrowCircleDown } from '@/svg/icons.tsx';

type ChatInterfaceProps = {
    needScroll: boolean;
    setTarget: (target: HTMLDivElement | null) => void;
    setShowScrollDownButton: (a: boolean) => void;
    showScrollDownButton: boolean;
};

const ChatInterface = React.forwardRef<HTMLDivElement, ChatInterfaceProps>(
    (
        { needScroll, setTarget }: ChatInterfaceProps,
        ref: ForwardedRef<HTMLDivElement>
    ) => {
        const messages: Message[] = useMessages();
        const process = listenMessageEvent();
        const current: number = useSelector(selectCurrent);
        const [selected, setSelected] = React.useState(-1);
        const [autoScroll, setAutoScroll] = useState(needScroll);
        const [showScrollDownButton, setShowScrollDownButton] = useState(false);
        const el = (ref as MutableRefObject<HTMLDivElement | null>).current;

        useEffect(() => {
            if (el) {
                const handleWheel = () => {
                    const isScrollUp =
                        el?.scrollHeight > el?.scrollTop + el?.clientHeight;
                    if (isScrollUp) {
                        // 检测向上滚动
                        setAutoScroll(false);
                        setShowScrollDownButton(true);
                    }
                    if (!isScrollUp) {
                        setShowScrollDownButton(false);
                    }
                };
                el.addEventListener('scroll', handleWheel);
                return () => {
                    if (el) {
                        el.removeEventListener('scroll', handleWheel);
                    }
                };
            }
        }, [ref, setShowScrollDownButton]);
        useEffect(() => {
            if (autoScroll) {
                const el = (ref as MutableRefObject<HTMLDivElement | null>)
                    .current;
                if (el) {
                    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                }
            }
        }, [messages, autoScroll, ref]);
        useEffect(() => {
            setAutoScroll(needScroll);
            if (el && el?.scrollHeight > el?.clientHeight) {
                setShowScrollDownButton(true);
            }
        }, [needScroll]);

        useEffect(() => {
            if (
                ref &&
                (ref as MutableRefObject<HTMLDivElement | null>).current
            ) {
                setTarget(
                    (ref as MutableRefObject<HTMLDivElement | null>).current
                );
            }
        }, [setTarget, ref]);

        function scrollToBottom() {
            const el = (ref as MutableRefObject<HTMLDivElement | null>).current;
            if (el) {
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                setAutoScroll(true);
                setShowScrollDownButton(false);
            }
        }

        return (
            <ScrollArea className={`chat-content`} ref={ref}>
                <div className={`chat-messages-wrapper`}>
                    {messages.map((message, i) => (
                        <MessageSegment
                            message={message}
                            end={i === messages.length - 1}
                            onEvent={(
                                event: string,
                                index?: number,
                                message?: string
                            ) => {
                                process({ id: current, event, index, message });
                            }}
                            key={i}
                            index={i}
                            selected={selected === i}
                            onFocus={() => setSelected(i)}
                            onFocusLeave={() => setSelected(-1)}
                        />
                    ))}
                </div>
                {showScrollDownButton && (
                    <Button
                        className="scroll-down-btn"
                        style={{ position: 'absolute', bottom: '10px' }} // CSS for sticky positioning
                        onClick={scrollToBottom}
                    >
                        <ArrowCircleDown
                            style={{
                                color: `hsla(var(--background-dynamic-circle)) !important`
                            }}
                        />
                    </Button>
                )}
            </ScrollArea>
        );
    }
);

export default ChatInterface;
