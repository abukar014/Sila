export default function StatusBar() {
  return (
    <div className="h-[51.5px] relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between px-[28px] py-[16px] relative size-full">
        <div className="h-[19.5px] relative shrink-0 w-[24.148px]">
          <p
            className="absolute font-semibold leading-[19.5px] left-0 text-[#2a1a1a] text-[13px] top-0 whitespace-nowrap"
            style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
          >
            9:41
          </p>
        </div>
        <div className="h-[19.5px] relative shrink-0 w-[21.75px]">
          <p
            className="font-semibold leading-[16px] relative shrink-0 text-[#2a1a1a] text-[12px] whitespace-nowrap"
            style={{ fontFamily: "'DM Sans', 'Noto Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
          >
            ●●●
          </p>
        </div>
      </div>
    </div>
  );
}
