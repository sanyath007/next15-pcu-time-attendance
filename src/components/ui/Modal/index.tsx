import React, { ReactNode } from 'react'
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import ModalContent from './ModalContent';

const Modal = (
    { isShow, onHide, title, children }: { isShow: boolean, onHide: any, title: string, children: ReactNode }
) => {

    return (
        <>
            {isShow && (
                <div 
                    className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 backdrop-blur-sm flex items-center justify-center p-2 z-50 animate-fadeIn`}
                    onClick={() => onHide(null)}
                >
                    <div 
                        className={`bg-white backdrop-blur-lg rounded-xl max-w-2xl w-full shadow-2xl transform transition-all duration-300 animate-scaleIn`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-br from-[#051937] to-[#151A0A] p-4 rounded-t-xl text-white`}>
                            <div className="flex justify-between items-start mb-0">
                                <h2 className="text-xl font-bold">{title}</h2>
                                <button 
                                    onClick={() => onHide(null)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal content */}
                        { children }
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </>
    )
}

export default Modal