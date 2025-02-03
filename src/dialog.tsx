import { closeDialog } from '../lib/signals.ts'
import SButton from './button-base.tsx';
import { FaChevronLeft } from "react-icons/fa"
import { BsThreeDots } from "react-icons/bs";

interface IDialogProps {
    noback?: boolean;
    onCancel?: () => void;
    onMenuClick?: () => void;
}
export default ({title, children, onCancel, noback, onMenuClick, className, ...rest }:
    IDialogProps & React.HTMLAttributes<HTMLDivElement>) =>
    <div className={`fixed inset-0 flex flex-col ${className}`} {...rest}>
        <div className="title shrink-0 px-2 flex justify-between items-center">
            <div className="w-6">
                {!noback && <SButton className="[app-region:no-drag]" onClick={onCancel ?? closeDialog}>
                    <FaChevronLeft className="w-6 h-6"/>
                </SButton>}
            </div>
            <div className="grow font-bold text-center [app-region:drag]">{title}</div>
            <div className="w-6">
                {onMenuClick && <SButton className="[app-region:no-drag]" onClick={onMenuClick}>
                    <BsThreeDots className="w-6 h-6"/>
                </SButton>}
            </div>
        </div>
        <div className="body grow overflow-y-auto">{children}</div>
    </div>;