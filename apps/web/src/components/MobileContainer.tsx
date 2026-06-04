import { ReactNode } from 'react';

export default function MobileContainer({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[#e0eeff] relative rounded-[40px] w-full max-w-[428px] mx-auto h-[926px] to-white">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}
