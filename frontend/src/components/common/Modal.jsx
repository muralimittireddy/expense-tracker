// frontend/src/components/common/Modal.jsx
import React from 'react';
import PropTypes from 'prop-types';

function Modal({ isOpen, onClose, title, children, footer }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-lg w-full m-4">
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none font-semibold">
                        &times;
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body mb-4">
                    {children}
                </div>

                {/* Modal Footer */}
                {footer && (
                    <div className="modal-footer flex justify-end space-x-3 pt-3 border-t border-gray-200 mt-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    footer: PropTypes.node, // Can be a React node (e.g., buttons)
};

export default Modal;