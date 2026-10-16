"use client";
import { useState } from 'react';

type TabType = 'wage' | 'severance';
type WageUnit = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function WageCalculator() {
  const [activeTab, setActiveTab] = useState<TabType>('wage');

  // --- [1] 시급/급여 계산기 상태 ---
  const MIN_WAGE_2026 = 10320;
  const [fromUnit, setFromUnit] = useState<WageUnit>('hourly');
  const [toUnit, setToUnit] = useState<WageUnit>('monthly');
  const [inputAmount, setInputAmount] = useState<string>('10,320');
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [weeklyDays, setWeeklyDays] = useState<number>(5);
  const [includeHolidayPay, setIncludeHolidayPay] = useState<boolean>(true);
  const [taxType, setTaxType] = useState<'none' | '3.3' | '9.4'>('none');

  // --- [2] 퇴직금 계산기 상태 ---
  const todayStr = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(oneYearAgoStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [monthlySalary, setMonthlySalary] = useState<string>('2,500,000');
  const [annualBonus, setAnnualBonus] = useState<string>('0');
  const [annualLeavePay, setAnnualLeavePay] = useState<string>('0');

  // 숫자 포맷 헬퍼
  const parseNum = (str: string) => Number(str.replace(/[^0-9]/g, '')) || 0;
  const formatNum = (num: number) => Math.round(num).toLocaleString('ko-KR');

  const handleCommaInput = (val: string, setter: (v: string) => void) => {
    const raw = val.replace(/[^0-9]/g, '');
    setter(raw === '' ? '' : Number(raw).toLocaleString('ko-KR'));
  };

  // --- [1] 시급/급여 환산 계산 로직 ---
  const amountNum = parseNum(inputAmount);
  const weeklyWorkHours = dailyHours * weeklyDays;
  // 주 15시간 이상 근무 시 주휴시간 발생 (최대 40시간 기준 8시간 비례)
  const weeklyHolidayHours = includeHolidayPay && weeklyWorkHours >= 15
    ? Math.min(weeklyWorkHours, 40) / 40 * 8
    : 0;
  const totalWeeklyPaidHours = weeklyWorkHours + weeklyHolidayHours;
  const WEEKS_PER_MONTH = 4.345238; // 365 / 12 / 7
  const totalMonthlyPaidHours = totalWeeklyPaidHours * WEEKS_PER_MONTH;

  // 입력 단위를 먼저 '기본 시급'으로 역산
  let baseHourly = 0;
  if (fromUnit === 'hourly') {
    baseHourly = amountNum;
  } else if (fromUnit === 'daily') {
    baseHourly = dailyHours > 0 ? amountNum / dailyHours : 0;
  } else if (fromUnit === 'weekly') {
    baseHourly = totalWeeklyPaidHours > 0 ? amountNum / totalWeeklyPaidHours : 0;
  } else if (fromUnit === 'monthly') {
    baseHourly = totalMonthlyPaidHours > 0 ? amountNum / totalMonthlyPaidHours : 0;
  } else if (fromUnit === 'yearly') {
    baseHourly = totalMonthlyPaidHours > 0 ? (amountNum / 12) / totalMonthlyPaidHours : 0;
  }

  // 기본 시급에서 각 단위로 계산
  const calcHourly = baseHourly;
  const calcDaily = baseHourly * dailyHours;
  const calcWeeklyWorkPay = baseHourly * weeklyWorkHours;
  const calcWeeklyHolidayPay = baseHourly * weeklyHolidayHours;
  const calcWeeklyTotal = calcWeeklyWorkPay + calcWeeklyHolidayPay;
  const calcMonthlyWorkPay = calcWeeklyWorkPay * WEEKS_PER_MONTH;
  const calcMonthlyHolidayPay = calcWeeklyHolidayPay * WEEKS_PER_MONTH;
  const calcMonthlyTotal = calcWeeklyTotal * WEEKS_PER_MONTH;
  const calcYearlyTotal = calcMonthlyTotal * 12;

  const getConvertedValue = (unit: WageUnit) => {
    switch (unit) {
      case 'hourly': return calcHourly;
      case 'daily': return calcDaily;
      case 'weekly': return calcWeeklyTotal;
      case 'monthly': return calcMonthlyTotal;
      case 'yearly': return calcYearlyTotal;
    }
  };

  const targetGross = getConvertedValue(toUnit);
  const taxRate = taxType === '3.3' ? 0.033 : taxType === '9.4' ? 0.094 : 0;
  const taxAmount = targetGross * taxRate;
  const targetNet = targetGross - taxAmount;

  const unitLabel: Record<WageUnit, string> = {
    hourly: '시급',
    daily: '일급',
    weekly: '주급',
    monthly: '월급',
    yearly: '연봉',
  };

  const handleResetWage = () => {
    setFromUnit('hourly');
    setToUnit('monthly');
    setInputAmount('10,320');
    setDailyHours(8);
    setWeeklyDays(5);
    setIncludeHolidayPay(true);
    setTaxType('none');
  };

  // --- [2] 퇴직금 계산 로직 ---
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  // 재직일수 (입사일 포함 ~ 퇴사일 전날 기준 또는 시작~종료 차이 일수)
  const totalEmploymentDays = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;

  // 퇴사 전 3개월 총 일수 계산 (통상 89~92일)
  const threeMonthsBefore = new Date(end);
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
  const daysInLast3Months = diffTime > 0
    ? Math.max(89, Math.min(92, Math.floor((end.getTime() - threeMonthsBefore.getTime()) / (1000 * 60 * 60 * 24))))
    : 91;

  const salaryNum = parseNum(monthlySalary);
  const bonusNum = parseNum(annualBonus);
  const leavePayNum = parseNum(annualLeavePay);

  // 3개월 급여 총액 + 상여금 가산액(3/12) + 연차수당 가산액(3/12)
  const threeMonthsWageTotal = (salaryNum * 3) + (bonusNum * (3 / 12)) + (leavePayNum * (3 / 12));
  const dailyAverageWage = daysInLast3Months > 0 ? threeMonthsWageTotal / daysInLast3Months : 0;
  // 퇴직금 = 1일 평균임금 × 30일 × (총 재직일수 / 365)
  const estimatedSeverance = dailyAverageWage * 30 * (totalEmploymentDays / 365);

  const handleResetSeverance = () => {
    setStartDate(oneYearAgoStr);
    setEndDate(todayStr);
    setMonthlySalary('2,500,000');
    setAnnualBonus('0');
    setAnnualLeavePay('0');
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5">
        
        {/* 상단 타이틀 */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-extrabold text-blue-600 mb-1">임금 · 퇴직금 계산기</h2>
          <p className="text-gray-500 text-xs sm:text-sm">주휴수당 포함 급여 환산부터 예상 퇴직금까지 간편하게 계산하세요.</p>
        </div>

        {/* 네이버 스타일 상단 탭 전환 (시급·급여 / 퇴직금) */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('wage')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'wage' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💰 시급 · 급여 계산
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('severance')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'severance' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏦 퇴직금 계산
          </button>
        </div>

        {/* ==================== 탭 1: 시급/급여 계산기 ==================== */}
        {activeTab === 'wage' && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {/* 네이버 스타일 환산 바: [시급 v] [10,320] 원을 [월급 v] 으로 환산 */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value as WageUnit)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">시급</option>
                  <option value="daily">일급</option>
                  <option value="weekly">주급</option>
                  <option value="monthly">월급</option>
                  <option value="yearly">연봉</option>
                </select>

                <div className="relative flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={inputAmount}
                    onChange={(e) => handleCommaInput(e.target.value, setInputAmount)}
                    placeholder="금액 입력"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-right font-extrabold text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-sm font-bold text-gray-500">원</span>
                </div>

                <span className="text-sm font-medium text-gray-600">을</span>

                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value as WageUnit)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">시급</option>
                  <option value="daily">일급</option>
                  <option value="weekly">주급</option>
                  <option value="monthly">월급</option>
                  <option value="yearly">연봉</option>
                </select>

                <span className="text-sm font-medium text-gray-600">으로 환산</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                <span>※ 2026년 최저시급은 <strong className="text-red-500 font-bold">10,320원</strong>입니다.</span>
                <button
                  type="button"
                  onClick={() => {
                    setFromUnit('hourly');
                    setInputAmount(MIN_WAGE_2026.toLocaleString('ko-KR'));
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  최저시급 적용
                </button>
              </div>
            </div>

            {/* 근무 조건 설정 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">일일 근무시간</label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (i + 1) * 0.5).concat([13, 14, 15, 16]).filter((v, i, a) => a.indexOf(v) === i && v <= 16).map((h) => (
                    <option key={h} value={h}>{h}시간</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">한주 근무일수</label>
                <select
                  value={weeklyDays}
                  onChange={(e) => setWeeklyDays(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>주 {d}일</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">주휴수당 (주 15시간 이상)</label>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIncludeHolidayPay(true)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      includeHolidayPay ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    포함 ({weeklyHolidayHours.toFixed(1).replace('.0', '')}시간)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeHolidayPay(false)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      !includeHolidayPay ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    미포함
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">세금 공제 선택</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value as 'none' | '3.3' | '9.4')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">미적용 (세전)</option>
                  <option value="3.3">프리랜서·알바 (3.3%)</option>
                  <option value="9.4">4대보험 (약 9.4%)</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100 flex justify-between items-center">
              <span>
                주 소정근로 <strong>{weeklyWorkHours}시간</strong> + 주휴 <strong>{weeklyHolidayHours.toFixed(1).replace('.0', '')}시간</strong> = 한주 유급 <strong>{(weeklyWorkHours + weeklyHolidayHours).toFixed(1).replace('.0', '')}시간</strong>
              </span>
              <button
                type="button"
                onClick={handleResetWage}
                className="text-gray-500 hover:text-gray-800 font-bold underline shrink-0 ml-2"
              >
                초기화
              </button>
            </div>

            {/* 계산 결과 영역 */}
            <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 flex flex-col gap-3">
              <div className="flex justify-between items-center pb-3 border-b border-blue-200/60">
                <span className="text-gray-700 font-bold text-sm sm:text-base">
                  예상 {unitLabel[toUnit]} {taxType !== 'none' ? '(세후 실수령액)' : '(세전)'}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                  {formatNum(targetNet)}원
                </span>
              </div>

              {taxType !== 'none' && (
                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                  <span>세전 {unitLabel[toUnit]}: {formatNum(targetGross)}원</span>
                  <span className="text-red-500 font-semibold">공제액(-): {formatNum(taxAmount)}원</span>
                </div>
              )}

              {/* 주급/월급일 때 기본급 + 주휴수당 상세 표시 */}
              {(toUnit === 'weekly' || toUnit === 'monthly') && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col">
                    <span className="text-[11px] text-gray-500">기본 근무수당</span>
                    <span className="text-sm sm:text-base font-bold text-gray-800 mt-0.5">
                      {formatNum(toUnit === 'weekly' ? calcWeeklyWorkPay : calcMonthlyWorkPay)}원
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col">
                    <span className="text-[11px] text-blue-600 font-semibold">주휴수당</span>
                    <span className="text-sm sm:text-base font-bold text-blue-700 mt-0.5">
                      {formatNum(toUnit === 'weekly' ? calcWeeklyHolidayPay : calcMonthlyHolidayPay)}원
                    </span>
                  </div>
                </div>
              )}

              {/* 전체 단위 한눈에 보기 요약표 */}
              <div className="grid grid-cols-4 gap-1.5 mt-1 pt-2 border-t border-blue-200/40 text-center">
                <div className="bg-white/80 py-2 px-1 rounded-lg">
                  <div className="text-[10px] text-gray-400">일급</div>
                  <div className="text-xs font-bold text-gray-700 mt-0.5">{formatNum(calcDaily)}원</div>
                </div>
                <div className="bg-white/80 py-2 px-1 rounded-lg">
                  <div className="text-[10px] text-gray-400">주급</div>
                  <div className="text-xs font-bold text-gray-700 mt-0.5">{formatNum(calcWeeklyTotal)}원</div>
                </div>
                <div className="bg-white/80 py-2 px-1 rounded-lg">
                  <div className="text-[10px] text-gray-400">월급</div>
                  <div className="text-xs font-bold text-gray-700 mt-0.5">{formatNum(calcMonthlyTotal)}원</div>
                </div>
                <div className="bg-white/80 py-2 px-1 rounded-lg">
                  <div className="text-[10px] text-gray-400">연봉</div>
                  <div className="text-xs font-bold text-gray-700 mt-0.5">{formatNum(calcYearlyTotal)}원</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 탭 2: 퇴직금 계산기 ==================== */}
        {activeTab === 'severance' && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {/* 입사일 / 퇴사일 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">입사일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">퇴사일 (마지막 근무일 다음날)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 급여 정보 입력 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">최근 3개월 월평균 급여 (세전)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={monthlySalary}
                    onChange={(e) => handleCommaInput(e.target.value, setMonthlySalary)}
                    placeholder="예: 2,500,000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-right text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">원</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">연간 상여금 총액 <span className="text-gray-400 font-normal">(선택)</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={annualBonus}
                    onChange={(e) => handleCommaInput(e.target.value, setAnnualBonus)}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-right text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">원</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-700">연차수당 <span className="text-gray-400 font-normal">(선택)</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={annualLeavePay}
                    onChange={(e) => handleCommaInput(e.target.value, setAnnualLeavePay)}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-right text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">원</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100 flex justify-between items-center">
              <span>
                총 재직일수: <strong className={totalEmploymentDays >= 365 ? 'text-blue-600' : 'text-red-500'}>{totalEmploymentDays}일</strong>
                {totalEmploymentDays < 365 && ' (※ 1년(365일) 이상 근무 시 퇴직금 지급 대상)'}
              </span>
              <button
                type="button"
                onClick={handleResetSeverance}
                className="text-gray-500 hover:text-gray-800 font-bold underline shrink-0 ml-2"
              >
                초기화
              </button>
            </div>

            {/* 퇴직금 결과 영역 */}
            <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 flex flex-col gap-3">
              <div className="flex justify-between items-center pb-3 border-b border-blue-200/60">
                <span className="text-gray-700 font-bold text-sm sm:text-base">예상 퇴직금 (세전)</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                  {formatNum(estimatedSeverance)}원
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-1 text-center">
                <div className="bg-white py-2.5 px-2 rounded-xl border border-gray-100 flex flex-col">
                  <span className="text-[11px] text-gray-500">총 재직일수</span>
                  <span className="text-sm font-bold text-gray-800 mt-0.5">{totalEmploymentDays}일</span>
                </div>
                <div className="bg-white py-2.5 px-2 rounded-xl border border-gray-100 flex flex-col">
                  <span className="text-[11px] text-gray-500">3개월 기준일수</span>
                  <span className="text-sm font-bold text-gray-800 mt-0.5">{daysInLast3Months}일</span>
                </div>
                <div className="bg-white py-2.5 px-2 rounded-xl border border-blue-100 flex flex-col">
                  <span className="text-[11px] text-blue-600 font-semibold">1일 평균임금</span>
                  <span className="text-sm font-bold text-blue-700 mt-0.5">{formatNum(dailyAverageWage)}원</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              ※ 퇴직금은 「주 15시간 이상, 1년 이상 근속」 시 발생하며, 실제 지급액은 세금 및 회사 규정에 따라 차이가 있을 수 있습니다.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
