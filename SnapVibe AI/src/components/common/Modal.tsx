import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md sm:max-w-lg md:max-w-4xl bg-slate-900 rounded-2xl shadow-2xl">
              {children}
            </Dialog.Panel>
          </div>
        </div>

      </Dialog>
    </Transition>
  );
}