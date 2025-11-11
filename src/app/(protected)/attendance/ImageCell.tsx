"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import Modal from "@/components/ui/Modal";
import ModalContent from "@/components/ui/Modal/ModalContent";

export const ImageCell = ({ url }: { url: string }) => {
    const [show, setShow] = useState<boolean>(false);

    return (
        <TableCell className="text-center">
            <span className="flex justify-center">
                <Images onClick={() => setShow(true)} className="cursor-pointer" />
            </span>

            <Modal
                isShow={show}
                onHide={() => setShow(false)}
                title="รูปถ่าย"
            >
                <ModalContent>
                    <img src={url} />
                </ModalContent>
            </Modal>
        </TableCell>
    )
}