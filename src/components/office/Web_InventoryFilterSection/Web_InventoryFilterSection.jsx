export default function Web_InventoryFilterSection({
  filters,
  onChange,
  onReset,
  onSearch,
}) {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-primary rounded-full"></span>
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Search Filter
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
            QR번호
          </label>
          <input
            type="text"
            value={filters.qrNumber}
            onChange={(e) => onChange("qrNumber", e.target.value)}
            placeholder="QR입력"
            className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-body"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
            제강사
          </label>
          <select
            value={filters.manufacturer}
            onChange={(e) => onChange("manufacturer", e.target.value)}
            className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-body appearance-none"
          >
            <option value="전체">전체 (All)</option>
            <option value="Hyundai Steel">Hyundai Steel</option>
            <option value="POSCO">POSCO</option>
            <option value="Dongkuk Steel">Dongkuk Steel</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
            재질
          </label>
          <select
            value={filters.material}
            onChange={(e) => onChange("material", e.target.value)}
            className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-body"
          >
            <option value="전체">전체 (All)</option>
            <option value="SS400">GS400</option>
            <option value="SM490">SM355A</option>
            <option value="SHN490">SM420B</option>
            <option value="SHN490">SS275</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
            두께
          </label>
          <select
            value={filters.thickness}
            onChange={(e) => onChange("thickness", e.target.value)}
            className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-body"
          >
            <option value="전체">전체 (All)</option>
            <option value="6-10">6mm - 10mm</option>
            <option value="11-20">11mm - 20mm</option>
            <option value="21+">21mm - 30mm</option>
            <option value="31+">31mm - 40mm</option>
            <option value="41+">41mm +</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
            폭
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.widthMin}
              onChange={(e) => onChange("widthMin", e.target.value)}
              placeholder="From"
              className="w-1/2 h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
            />
            <span className="text-on-surface-variant">~</span>
            <input
              type="number"
              value={filters.widthMax}
              onChange={(e) => onChange("widthMax", e.target.value)}
              placeholder="To"
              className="w-1/2 h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
            길이
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.lengthMin}
              onChange={(e) => onChange("lengthMin", e.target.value)}
              placeholder="Min"
              className="w-1/2 h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
            />
            <span className="text-on-surface-variant">~</span>
            <input
              type="number"
              value={filters.lengthMax}
              onChange={(e) => onChange("lengthMax", e.target.value)}
              placeholder="Max"
              className="w-1/2 h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="
    px-8 py-3 
    bg-gradient-to-r from-primary to-primary-dim 
    text-white 
    rounded-lg 
    font-bold 
    shadow-md 
    hover:shadow-lg 
    hover:brightness-110
    transition-all 
    active:scale-95 
    flex items-center gap-2
  "
        >
          <span className="material-symbols-outlined text-sm">search</span>
          조회 (Search)
        </button>
      </div>
    </section>
  );
}
