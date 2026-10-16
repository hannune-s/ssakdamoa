"use client";

import React, { useState, useEffect } from 'react';

interface CarrierInfo {
  id: string;
  name: string;
  shortName: string;
  tel: string;
  officialUrl: string;
  buildTrackUrl?: (trackNo: string) => string;
  popular?: boolean;
}

const CARRIERS: CarrierInfo[] = [
  {
    id: 'kr.cjlogistics',
    name: 'CJ대한통운',
    shortName: 'CJ대한통운',
    tel: '1588-1255',
    officialUrl: 'https://www.cjlogistics.com/ko/tool/parcel/tracking',
    buildTrackUrl: (no) => `https://trace.cjlogistics.com/next/tracking.html?wblNo=${no}`,
    popular: true,
  },
  {
    id: 'kr.epost',
    name: '우체국택배',
    shortName: '우체국',
    tel: '1588-1300',
    officialUrl: 'https://service.epost.go.kr/iservice/usr/trace/usrtrc001k01.jsp',
    buildTrackUrl: (no) => `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${no}`,
    popular: true,
  },
  {
    id: 'kr.hanjin',
    name: '한진택배',
    shortName: '한진택배',
    tel: '1588-0011',
    officialUrl: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillSch.do?mCode=MN038',
    buildTrackUrl: (no) => `https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnumText2=${no}`,
    popular: true,
  },
  {
    id: 'kr.lotte',
    name: '롯데택배',
    shortName: '롯데택배',
    tel: '1588-2121',
    officialUrl: 'https://www.lotteglogis.com/home/reservation/tracking/index',
    buildTrackUrl: (no) => `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${no}`,
    popular: true,
  },
  {
    id: 'kr.logen',
    name: '로젠택배',
    shortName: '로젠택배',
    tel: '1588-9988',
    officialUrl: 'https://www.ilogen.com/web/personal/tkSearch',
    buildTrackUrl: (no) => `https://www.ilogen.com/web/personal/trace/${no}`,
    popular: true,
  },
  {
    id: 'kr.cvsnet',
    name: 'GS Postbox 편의점택배',
    shortName: 'GS편의점',
    tel: '1577-1287',
    officialUrl: 'https://www.cvsnet.co.kr/invoice/tracking.do',
    buildTrackUrl: (no) => `https://www.cvsnet.co.kr/invoice/tracking.do?invoice_no=${no}`,
    popular: true,
  },
  {
    id: 'kr.cupost',
    name: 'CU 편의점택배',
    shortName: 'CU편의점',
    tel: '1577-1287',
    officialUrl: 'https://www.cupost.co.kr/postbox/delivery/localResult.cupost',
    popular: true,
  },
  {
    id: 'kr.kdexp',
    name: '경동택배',
    shortName: '경동택배',
    tel: '1899-5368',
    officialUrl: 'https://kdexp.com/index.kd',
    buildTrackUrl: (no) => `https://kdexp.com/service/delivery/etc/delivery.kd?barcode=${no}`,
    popular: true,
  },
  {
    id: 'kr.daesin',
    name: '대신택배',
    shortName: '대신택배',
    tel: '043-222-4582',
    officialUrl: 'https://www.ds3211.co.kr/',
  },
  {
    id: 'kr.hdexp',
    name: '합동택배',
    shortName: '합동택배',
    tel: '1899-3392',
    officialUrl: 'https://hdexp.co.kr/',
  },
  {
    id: 'kr.ilyanglogis',
    name: '일양로지스',
    shortName: '일양로지스',
    tel: '1588-0002',
    officialUrl: 'https://www.ilyanglogis.com/functionality/tracking.asp',
  },
  {
    id: 'kr.chunilps',
    name: '천일택배',
    shortName: '천일택배',
    tel: '1877-6606',
    officialUrl: 'https://www.chunil.co.kr/HTrace/HTrace.jsp',
  },
  {
    id: 'kr.kunyoung',
    name: '건영택배',
    shortName: '건영택배',
    tel: '053-354-3001',
    officialUrl: 'https://www.kunyoung.com/goods/goods_01.php',
  },
  {
    id: 'kr.hanips',
    name: '한의사랑택배',
    shortName: '한의사랑',
    tel: '1600-1055',
    officialUrl: 'https://www.hanips.com/',
  },
  {
    id: 'kr.coupangls',
    name: '쿠팡 로지스틱스(CLS)',
    shortName: '쿠팡CLS',
    tel: '1577-7011',
    officialUrl: 'https://www.coupangls.com/',
  },
  {
    id: 'kr.epost.ems',
    name: '우체국 EMS (국제특급)',
    shortName: '우체국EMS',
    tel: '1588-1300',
    officialUrl: 'https://ems.epost.go.kr/',
  },
  {
    id: 'de.dhl',
    name: 'DHL (해외특송)',
    shortName: 'DHL',
    tel: '1588-0001',
    officialUrl: 'https://www.dhl.com/kr-ko/home/tracking.html',
  },
  {
    id: 'us.fedex',
    name: 'FedEx (페덱스)',
    shortName: 'FedEx',
    tel: '1588-0588',
    officialUrl: 'https://www.fedex.com/ko-kr/tracking.html',
  },
  {
    id: 'us.ups',
    name: 'UPS (국제특송)',
    shortName: 'UPS',
    tel: '1588-6886',
    officialUrl: 'https://www.ups.com/track?loc=ko_KR',
  },
];

interface TrackProgress {
  time: string;
  status: { id: string; text: string };
  location?: { name: string };
  description?: string;
}

interface TrackResult {
  from?: { name?: string; time?: string };
  to?: { name?: string; time?: string };
  state?: { id: string; text: string };
  progresses?: TrackProgress[];
}

interface RecentSearchItem {
  carrierId: string;
  carrierName: string;
  trackNo: string;
  Memo?: string;
  savedAt: string;
}

const STEPS = [
  { key: 'information_received', label: '상품인수', icon: '📦' },
  { key: 'in_transit', label: '상품이동중', icon: '🚚' },
  { key: 'out_for_delivery', label: '배달출발', icon: '🏃' },
  { key: 'delivered', label: '배달완료', icon: '✅' },
];

export default function ParcelTracker() {
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('kr.cjlogistics');
  const [trackNo, setTrackNo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [trackData, setTrackData] = useState<TrackResult | null>(null);
  const [searchedCarrier, setSearchedCarrier] = useState<CarrierInfo | null>(null);
  const [searchedTrackNo, setSearchedTrackNo] = useState<string>('');
  const [recentList, setRecentList] = useState<RecentSearchItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ssakdamoa_recent_tracks');
      if (saved) {
        setRecentList(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentTrack = (carrier: CarrierInfo, cleanNo: string) => {
    try {
      const filtered = recentList.filter(
        (item) => !(item.carrierId === carrier.id && item.trackNo === cleanNo)
      );
      const updated: RecentSearchItem[] = [
        {
          carrierId: carrier.id,
          carrierName: carrier.name,
          trackNo: cleanNo,
          savedAt: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        },
        ...filtered,
      ].slice(0, 8);
      setRecentList(updated);
      localStorage.setItem('ssakdamoa_recent_tracks', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentTrack = (carrierId: string, no: string) => {
    const updated = recentList.filter(
      (item) => !(item.carrierId === carrierId && item.trackNo === no)
    );
    setRecentList(updated);
    localStorage.setItem('ssakdamoa_recent_tracks', JSON.stringify(updated));
  };

  const handleTrackSearch = async (
    e?: React.FormEvent,
    overrideCarrierId?: string,
    overrideTrackNo?: string
  ) => {
    if (e) e.preventDefault();

    const targetCarrierId = overrideCarrierId || selectedCarrierId;
    const rawNo = overrideTrackNo !== undefined ? overrideTrackNo : trackNo;
    const cleanNo = rawNo.replace(/[^0-9a-zA-Z]/g, '').trim();

    if (!targetCarrierId) {
      alert('택배사를 선택해주세요.');
      return;
    }
    if (!cleanNo) {
      alert('운송장 번호를 입력해주세요.');
      return;
    }

    const carrier = CARRIERS.find((c) => c.id === targetCarrierId) || CARRIERS[0];
    setSelectedCarrierId(carrier.id);
    setTrackNo(cleanNo);
    setSearchedCarrier(carrier);
    setSearchedTrackNo(cleanNo);
    setLoading(true);
    setErrorMsg('');
    setTrackData(null);

    saveRecentTrack(carrier, cleanNo);

    try {
      const res = await fetch(
        `https://apis.tracker.delivery/carriers/${encodeURIComponent(carrier.id)}/tracks/${encodeURIComponent(cleanNo)}`
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        setErrorMsg(
          errJson?.message ||
            '운송장 정보가 아직 등록되지 않았거나 택배사 홈페이지에서 직접 확인이 필요한 번호입니다.'
        );
      } else {
        const data: TrackResult = await res.json();
        setTrackData(data);
      }
    } catch {
      setErrorMsg('실시간 조회 서버 연결이 지연되고 있습니다. 아래 공식 조회 버튼을 이용해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (stateId?: string) => {
    if (!stateId) return 0;
    if (stateId === 'delivered') return 3;
    if (stateId === 'out_for_delivery') return 2;
    if (stateId === 'in_transit' || stateId === 'at_pickup') return 1;
    return 0;
  };

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 네이버 스타일 택배배송 조회 메인 박스 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>📦</span> 택배배송 조회
          </h2>
          <span className="text-xs font-bold text-[#03C75A] bg-[#03C75A]/10 px-2.5 py-1 rounded-full">
            통합 실시간 조회
          </span>
        </div>

        {/* 자주 쓰는 택배사 원클릭 칩 버튼 */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {CARRIERS.filter((c) => c.popular).map((c) => {
            const active = selectedCarrierId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCarrierId(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#03C75A] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.shortName}
              </button>
            );
          })}
        </div>

        <form onSubmit={(e) => handleTrackSearch(e)} className="space-y-3">
          {/* 택배사 선택 드롭다운 (네이버 스타일 언더라인/박스형) */}
          <div className="relative">
            <select
              value={selectedCarrierId}
              onChange={(e) => setSelectedCarrierId(e.target.value)}
              aria-label="택배사 선택"
              className="w-full appearance-none bg-white border-b-2 border-gray-200 focus:border-[#03C75A] py-3 pl-2 pr-8 text-sm sm:text-[15px] font-bold text-gray-800 outline-none transition-colors cursor-pointer"
            >
              {CARRIERS.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.name} (고객센터: {carrier.tel})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* 운송장 번호 입력란 + 우측 초록색 돋보기 버튼 */}
          <div className="flex items-center border border-gray-300 focus-within:border-[#03C75A] focus-within:ring-2 focus-within:ring-[#03C75A]/20 rounded-xl overflow-hidden bg-white transition-all">
            <input
              type="text"
              inputMode="numeric"
              value={trackNo}
              onChange={(e) => setTrackNo(e.target.value.replace(/-/g, ''))}
              placeholder="운송장 번호 - 없이 입력"
              className="flex-1 px-4 py-3.5 text-sm sm:text-[15px] text-gray-900 placeholder-gray-400 outline-none font-mono"
            />
            {trackNo && (
              <button
                type="button"
                onClick={() => {
                  setTrackNo('');
                  setTrackData(null);
                  setErrorMsg('');
                }}
                className="px-2 text-gray-300 hover:text-gray-500 text-sm font-bold"
                aria-label="입력 지우기"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-5 py-3.5 bg-white hover:bg-emerald-50 text-[#03C75A] border-l border-gray-200 font-extrabold flex items-center justify-center transition-colors shrink-0"
              aria-label="배송 조회"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#03C75A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* 최근 조회한 송장번호 */}
        {recentList.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">🕒 최근 조회 내역</span>
              <button
                type="button"
                onClick={() => {
                  setRecentList([]);
                  localStorage.removeItem('ssakdamoa_recent_tracks');
                }}
                className="text-[11px] text-gray-400 hover:text-red-500 font-semibold"
              >
                전체 삭제
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentList.map((item) => (
                <div
                  key={`${item.carrierId}-${item.trackNo}`}
                  className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleTrackSearch(undefined, item.carrierId, item.trackNo)}
                    className="flex items-center gap-1.5 text-left"
                  >
                    <span className="font-bold text-gray-700">{item.carrierName}</span>
                    <span className="font-mono text-blue-600 font-semibold">{item.trackNo}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecentTrack(item.carrierId, item.trackNo)}
                    className="text-gray-300 hover:text-red-500 font-bold ml-0.5"
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100 break-keep">
          본 정보는 스마트택배 및 공개 배송조회 API에서 제공받는 정보로, 실제 배송상황과 다를 수 있습니다.
        </p>
      </div>

      {/* 조회 결과 영역 */}
      {(trackData || errorMsg) && searchedCarrier && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#03C75A]">{searchedCarrier.name}</span>
                <span className="text-sm font-mono font-bold text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                  {searchedTrackNo}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                고객센터: <a href={`tel:${searchedCarrier.tel}`} className="underline hover:text-gray-600">{searchedCarrier.tel}</a>
              </div>
            </div>

            {/* 네이버 / 공식 홈페이지 원클릭 팝업 버튼 */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                  `${searchedCarrier.name} ${searchedTrackNo}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-extrabold px-3 py-2 rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                <span>N</span> 네이버에서 보기 ↗
              </a>
              <a
                href={
                  searchedCarrier.buildTrackUrl
                    ? searchedCarrier.buildTrackUrl(searchedTrackNo)
                    : searchedCarrier.officialUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                🚚 택배사 공식조회 ↗
              </a>
            </div>
          </div>

          {trackData ? (
            <>
              {/* 현재 상태 요약 및 4단계 진행 스텝 바 */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                <div className="text-center mb-4">
                  <span className="inline-block bg-[#03C75A] text-white text-xs font-extrabold px-3 py-1 rounded-full mb-1">
                    {trackData.state?.text || '배송 진행중'}
                  </span>
                  {(trackData.from?.name || trackData.to?.name) && (
                    <div className="text-xs text-gray-600 font-semibold mt-1">
                      {trackData.from?.name && <span>보내는분: {trackData.from.name}</span>}
                      {trackData.from?.name && trackData.to?.name && <span className="mx-2 text-gray-300">|</span>}
                      {trackData.to?.name && <span>받는분: {trackData.to.name}</span>}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 relative">
                  {STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(trackData.state?.id);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-base mb-1.5 transition-all ${
                            isCurrent
                              ? 'bg-[#03C75A] text-white ring-4 ring-[#03C75A]/20 font-bold scale-105'
                              : isDone
                              ? 'bg-emerald-100 text-emerald-700 font-bold'
                              : 'bg-white border border-gray-200 text-gray-300'
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-[11px] sm:text-xs font-bold whitespace-nowrap ${
                            isCurrent ? 'text-[#03C75A] font-extrabold' : isDone ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 시간대별 상세 이동 경로 */}
              {trackData.progresses && trackData.progresses.length > 0 ? (
                <div className="overflow-hidden border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                        <th className="py-2.5 px-3 whitespace-nowrap">일시</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">현재위치</th>
                        <th className="py-2.5 px-3">배송상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...trackData.progresses].reverse().map((prog, i) => (
                        <tr key={i} className={i === 0 ? 'bg-emerald-50/30 font-semibold' : 'hover:bg-gray-50'}>
                          <td className="py-3 px-3 text-gray-500 font-mono whitespace-nowrap align-top">
                            {formatDateTime(prog.time)}
                          </td>
                          <td className="py-3 px-3 text-gray-800 font-bold whitespace-nowrap align-top">
                            {prog.location?.name || '-'}
                          </td>
                          <td className="py-3 px-3 text-gray-700 align-top">
                            <span className="font-bold text-gray-900 mr-1.5">[{prog.status?.text}]</span>
                            <span className="text-gray-600 break-keep">{prog.description}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">
                  상세 이동 내역이 아직 없습니다.
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center space-y-3">
              <p className="text-xs sm:text-sm font-bold text-gray-700 break-keep">{errorMsg}</p>
              <p className="text-xs text-gray-500 break-keep">
                아래 버튼을 누르시면 네이버 또는 {searchedCarrier.name} 공식 조회 창에서 즉시 확인하실 수 있습니다.
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <a
                  href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                    `${searchedCarrier.name} ${searchedTrackNo}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#03C75A] hover:bg-[#02b350] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  🟢 네이버 택배조회 결과 바로열기
                </a>
                <a
                  href={
                    searchedCarrier.buildTrackUrl
                      ? searchedCarrier.buildTrackUrl(searchedTrackNo)
                      : searchedCarrier.officialUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  🚚 {searchedCarrier.shortName} 공식 페이지 열기
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
