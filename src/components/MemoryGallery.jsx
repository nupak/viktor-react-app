import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import LightGallery from "lightgallery/react";
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

const LG_PLUGINS = [lgZoom, lgThumbnail];
const LG_LICENSE = "0000-0000-000-0000";

function buildDynamicEl(items) {
  if (!items?.length) return [];
  return items.map((item) => {
    const src = `/media/${item.imageKey}.jpg`;
    return {
      src,
      thumb: src,
      imageKey: item.imageKey,
      pairWithNext: Boolean(item.pairWithNext),
      stackUnder: typeof item.stackUnder === "string" ? item.stackUnder : null,
      ...(item.subHtml ? { subHtml: item.subHtml } : {})
    };
  });
}

/** Кадры, которые рисуются в колонке hero под указанным imageKey — не в masonry */
function indicesStackedUnderHero(dynamicEl) {
  const under = new Set();
  for (let i = 3; i < dynamicEl.length; i += 1) {
    const key = dynamicEl[i].stackUnder;
    if (!key) continue;
    if ([0, 1, 2].some((h) => dynamicEl[h].imageKey === key)) {
      under.add(i);
    }
  }
  return under;
}

function heroColumnExtras(colIndex, dynamicEl, stackedIndices) {
  const mainKey = dynamicEl[colIndex].imageKey;
  const out = [];
  for (const i of stackedIndices) {
    if (dynamicEl[i].stackUnder === mainKey) {
      out.push({ item: dynamicEl[i], index: i });
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

/** Склеивает пары (pairWithNext + следующий кадр) в один «кирпич» для masonry */
function groupMasonryPairs(entries) {
  if (!entries.length) return [];
  const out = [];
  for (let i = 0; i < entries.length; i += 1) {
    const cur = entries[i];
    const next = entries[i + 1];
    if (cur.item.pairWithNext && next) {
      out.push({ kind: "pair", a: cur, b: next });
      i += 1;
    } else {
      out.push({ kind: "single", entry: cur });
    }
  }
  return out;
}

function useMasonryColumnCount() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 420) setN(1);
      else if (w < 720) setN(2);
      else setN(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return n;
}

/** Кладём следующий блок в колонку с меньшим числом кирпичей — нижние фото не «висят» под длинной колонкой */
function splitIntoShortestColumns(units, columnCount) {
  if (columnCount <= 1) {
    return units.length ? [units] : [[]];
  }
  const cols = Array.from({ length: columnCount }, () => []);
  units.forEach((unit) => {
    let best = 0;
    for (let c = 1; c < columnCount; c += 1) {
      if (cols[c].length < cols[best].length) best = c;
    }
    cols[best].push(unit);
  });
  return cols;
}

function MemoryGalleryInner({ gallery }) {
  const lgInstanceRef = useRef(null);
  const items = gallery?.items ?? [];
  const dynamicEl = useMemo(() => buildDynamicEl(items), [items]);
  const lightGallerySlides = useMemo(
    () =>
      dynamicEl.map(({ src, thumb, subHtml }) => ({
        src,
        thumb,
        ...(subHtml ? { subHtml } : {})
      })),
    [dynamicEl]
  );
  const stackedUnderHero = useMemo(() => indicesStackedUnderHero(dynamicEl), [dynamicEl]);
  const heroRow = useMemo(() => dynamicEl.slice(0, 3), [dynamicEl]);
  const masonryEntries = useMemo(() => {
    const list = [];
    for (let i = 3; i < dynamicEl.length; i += 1) {
      if (stackedUnderHero.has(i)) continue;
      list.push({ item: dynamicEl[i], index: i });
    }
    return list;
  }, [dynamicEl, stackedUnderHero]);
  const masonryUnits = useMemo(() => groupMasonryPairs(masonryEntries), [masonryEntries]);
  const columnCount = useMasonryColumnCount();
  const columns = useMemo(
    () => splitIntoShortestColumns(masonryUnits, columnCount),
    [masonryUnits, columnCount]
  );

  const onInit = useCallback((detail) => {
    lgInstanceRef.current = detail.instance;
  }, []);

  const openAt = useCallback((index, element) => {
    lgInstanceRef.current?.openGallery(index, element ?? undefined);
  }, []);

  if (!dynamicEl.length) {
    return null;
  }

  const heroRowClass =
    heroRow.length >= 3
      ? "memory-gallery-hero-row memory-gallery-hero-row--3"
      : heroRow.length === 2
        ? "memory-gallery-hero-row memory-gallery-hero-row--2"
        : "memory-gallery-hero-row memory-gallery-hero-row--single";

  return (
    <div className="memory-gallery">
      {heroRow.length > 0 ? (
        <div className={heroRowClass}>
          {heroRow.map((item, colIndex) => {
            const extras = heroColumnExtras(colIndex, dynamicEl, stackedUnderHero);
            return (
              <div key={`${item.src}-hero-col-${colIndex}`} className="memory-gallery-hero-stack">
                <button
                  type="button"
                  className="memory-gallery-thumb"
                  onClick={(e) => openAt(colIndex, e.currentTarget)}
                >
                  <img src={item.thumb} alt="" loading="lazy" decoding="async" />
                </button>
                {extras.map(({ item: exItem, index: exIndex }) => (
                  <button
                    key={`${exItem.src}-hero-under-${exIndex}`}
                    type="button"
                    className="memory-gallery-thumb"
                    onClick={(e) => openAt(exIndex, e.currentTarget)}
                  >
                    <img src={exItem.thumb} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}

      {masonryEntries.length > 0 ? (
        <div className="memory-gallery-masonry" data-columns={columnCount}>
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="memory-gallery-masonry-col">
              {col.map((unit) =>
                unit.kind === "pair" ? (
                  <div key={`pair-${unit.a.index}-${unit.b.index}`} className="memory-gallery-pair-row">
                    <button
                      type="button"
                      className="memory-gallery-thumb"
                      onClick={(e) => openAt(unit.a.index, e.currentTarget)}
                    >
                      <img src={unit.a.item.thumb} alt="" loading="lazy" decoding="async" />
                    </button>
                    <button
                      type="button"
                      className="memory-gallery-thumb"
                      onClick={(e) => openAt(unit.b.index, e.currentTarget)}
                    >
                      <img src={unit.b.item.thumb} alt="" loading="lazy" decoding="async" />
                    </button>
                  </div>
                ) : (
                  <button
                    key={`${unit.entry.item.src}-${unit.entry.index}`}
                    type="button"
                    className="memory-gallery-thumb"
                    onClick={(e) => openAt(unit.entry.index, e.currentTarget)}
                  >
                    <img src={unit.entry.item.thumb} alt="" loading="lazy" decoding="async" />
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      ) : null}
      <LightGallery
        onInit={onInit}
        dynamic
        dynamicEl={lightGallerySlides}
        plugins={LG_PLUGINS}
        licenseKey={LG_LICENSE}
        speed={400}
        download={false}
        elementClassNames="memory-gallery-lg-root"
      />
    </div>
  );
}

function propsAreEqual(prev, next) {
  return prev.gallery?.items === next.gallery?.items;
}

export default memo(MemoryGalleryInner, propsAreEqual);
