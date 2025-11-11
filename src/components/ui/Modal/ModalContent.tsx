import { ReactNode } from "react";

export default function ModalContent({ children }: { children: ReactNode }) {
    return (
        <div className="p-8 space-y-6">
            {children}
        </div>
    );
}