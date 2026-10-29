"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Calculator from '@/components/Calculator';
import WageCalculator from '@/components/WageCalculator';
import ParcelTracker from '@/components/ParcelTracker';
import { fetchPublicTodayVisitorCount } from './admin/actions';

const CATEGORIES = ['전체', '페이·가맹', '결제·POS', '배달·입점 관리', '디자인·제작 툴', '필수 실무 링크', '실무 서식·양식', '마진 계산기', '급여 계산기', '통합 송장조회', '포장·패키지', '식자재·식품', '매장 렌털·케어', '간판·현수막 제작', '매장관리 추천앱'];

// 정적 링크 데이터 (실무 서식·양식 제외)
const STATIC_LINKS = [
  // 전국 단위 (페이·가맹)
  { id: 'static-1', title: '제로페이 가맹 신청', desc: '소상공인 수수료 부담을 낮춘 간편결제', category: '페이·가맹', keywords: ['제로페이', '페이', '가맹'], url: 'https://www.zeropay.or.kr/UI_HP_001.act' },
  { id: 'static-2', title: '온누리 가맹 신청', desc: '전통시장 및 상점가 전용 상품권', category: '페이·가맹', keywords: ['온누리', '가맹', '신청', '온누리상품권'], url: 'https://frc.sbiz.or.kr/afms/afm/SMMDL0001M01/page.do' },
  { id: 'static-14', title: '농할상품권 가맹 신청', desc: '우리 농수축산물 전용 할인 상품권', category: '페이·가맹', keywords: ['농할상품권', '농할', '가맹', '신청'], url: 'https://app.catchsecu.com/projects/2816edfa3b5d25f/form' },
  
  // 핵심 인구 밀집 지역화폐 (페이·가맹)
  { id: 'static-10', title: '서울페이+ 가맹 신청', desc: '서울 지역 전용 모바일 결제', category: '페이·가맹', keywords: ['서울페이', '서울페이플러스', '서울', '지역화폐'], url: 'https://seoulpay.shinhancard.com/' },
  { id: 'static-11', title: '경기지역화폐 가맹 신청', desc: '경기도 시·군별 지역화폐', category: '페이·가맹', keywords: ['경기지역화폐', '경기', '경기도', '지역화폐'], url: 'https://www.gmoney.or.kr/' },
  { id: 'static-3', title: '인천이음카드 가맹 신청', desc: '인천광역시 지역화폐', category: '페이·가맹', keywords: ['인천이음', '지역화폐', '이음', '인천이음카드', '인천'], url: 'https://with.konacard.co.kr/8-1' },
  { id: 'static-12', title: '부산 동백전 가맹 신청', desc: '부산광역시 지역화폐', category: '페이·가맹', keywords: ['동백전', '부산', '지역화폐'], url: 'https://busandong100.kr/' },
  { id: 'static-13', title: '대구로페이 가맹 신청', desc: '대구광역시 지역화폐', category: '페이·가맹', keywords: ['대구로페이', '대구', '대구행복페이', '지역화폐'], url: 'https://minwon.daegu.go.kr/cvpl/AUTN-009/info' },
  { id: 'static-9', title: '김포페이 가맹 신청', desc: '경기도 김포시 지역화폐', category: '페이·가맹', keywords: ['김포페이', '지역화폐', '김포'], url: 'https://gppay.merchant-portal.co.kr/bridge/' },
  
  // 결제·POS
  { id: 'static-36', title: '페이히어 (모바일 POS)', desc: '스마트폰/태블릿으로 가볍게 쓰는 무료 포스기', category: '결제·POS', keywords: ['페이히어', '포스', 'POS', '결제', '카드결제', '원격결제', '간편결제'], url: 'https://payhere.in/' },
  { id: 'static-37', title: '페이앱 (원격/링크 결제)', desc: '단말기 없이 스마트폰으로 링크 및 원격 간편결제', category: '결제·POS', keywords: ['페이앱', '링크결제', '원격결제', '스마트폰결제', '간편결제', '수기결제'], url: 'https://www.payapp.kr/' },
  { id: 'static-38', title: '토스페이먼츠 (PG/간편결제)', desc: '온라인 쇼핑몰 및 매장의 빠르고 쉬운 간편결제', category: '결제·POS', keywords: ['토스', '토스페이먼츠', 'PG', '간편결제', '결제연동'], url: 'https://www.tosspayments.com/' },
  { id: 'static-39', title: 'IBK 박스포스 (스마트폰 카드결제)', desc: '스마트폰을 카드 결제기로 만들어주는 앱', category: '결제·POS', keywords: ['박스포스', 'IBK', '기업은행', '스마트폰결제', '포스', '간편결제', '원격결제'], url: 'https://pos.ibkbox.net/main/index.do' },

  // 배달·입점 관리
  { id: 'static-27', title: '배달의민족 (배민사장님광장)', desc: '배달의민족 입점 신청 및 가게 관리', category: '배달·입점 관리', keywords: ['배달의민족', '배민', '배달', '입점', '사장님광장'], url: 'https://ceo.baemin.com/' },
  { id: 'static-28', title: '쿠팡이츠 스토어 (입점/관리)', desc: '쿠팡이츠 입점 신청 및 가게 관리', category: '배달·입점 관리', keywords: ['쿠팡이츠', '쿠팡', '이츠', '배달', '입점', '스토어'], url: 'https://store.coupangeats.com/' },
  { id: 'static-29', title: '요기요 파트너스 (입점/관리)', desc: '요기요 입점 신청 및 가게 관리', category: '배달·입점 관리', keywords: ['요기요', '요기요파트너스', '배달', '입점'], url: 'https://partner.yogiyo.co.kr/' },
  { id: 'static-31', title: '신한 땡겨요 사장님라운지 (입점/관리)', desc: '신한은행의 착한 수수료 배달앱 입점 관리', category: '배달·입점 관리', keywords: ['신한', '땡겨요', '신한땡겨요', '배달', '입점', '사장님라운지'], url: 'https://boss.ddangyo.com/' },
  { id: 'static-30', title: '배달특급 가맹점 신청', desc: '수수료 부담 없는 경기도 공공배달앱', category: '배달·입점 관리', keywords: ['배달특급', '경기도배달앱', '공공배달앱', '배달', '입점'], url: 'https://www.specialdelivery.co.kr/' },
  
  // 디자인·제작 툴
  { id: 'static-17', title: '미리캔버스 (포스터/메뉴판 등)', desc: '누구나 쉬운 무료 디자인 템플릿 제작', category: '디자인·제작 툴', keywords: ['미리캔버스', '디자인', '포스터', '메뉴판', '배너', '제작'], url: 'https://www.miricanvas.com/' },
  { id: 'static-18', title: '망고보드 (카드뉴스/홍보물 등)', desc: '포스터, 카드뉴스 등 전문적인 홍보물 제작', category: '디자인·제작 툴', keywords: ['망고보드', '디자인', '카드뉴스', '홍보물', '배너', '제작'], url: 'https://www.mangoboard.net/' },
  { id: 'static-22', title: '캔바 (글로벌 디자인/로고 제작)', desc: '전 세계 1위 무료 디자인 플랫폼', category: '디자인·제작 툴', keywords: ['캔바', 'canva', '디자인', '포스터', '로고', '제작'], url: 'https://www.canva.com/ko_kr/' },
  { id: 'static-23', title: '픽사베이 (상업용 무료 이미지)', desc: '저작권 걱정 없는 고화질 이미지 무료 다운로드', category: '디자인·제작 툴', keywords: ['픽사베이', 'pixabay', '무료이미지', '사진', '디자인소스', '상업용무료'], url: 'https://pixabay.com/ko/' },
  { id: 'static-19', title: '아임웹 (쇼핑몰/홈페이지 제작)', desc: '코딩 없이 클릭만으로 만드는 웹사이트', category: '디자인·제작 툴', keywords: ['아임웹', '쇼핑몰', '홈페이지', '웹사이트', '제작'], url: 'https://imweb.me/' },
  { id: 'static-20', title: '식스샵 (쇼핑몰 제작)', desc: '쉽고 직관적인 자사 쇼핑몰 제작 솔루션', category: '디자인·제작 툴', keywords: ['식스샵', '쇼핑몰', '제작', '자사몰'], url: 'https://www.sixshop.com/' },
  { id: 'static-21', title: '카페24 (쇼핑몰 제작)', desc: '전문적인 글로벌 쇼핑몰 구축 솔루션', category: '디자인·제작 툴', keywords: ['카페24', '쇼핑몰', '제작', '자사몰', 'cafe24'], url: 'https://www.cafe24.com/' },
  { id: 'static-42', title: '가비아 (도메인/호스팅/웹메일)', desc: '쇼핑몰·홈페이지 운영을 위한 도메인 등록 및 호스팅', category: '디자인·제작 툴', keywords: ['가비아', '도메인', '호스팅', '웹메일', '웹사이트', '제작'], url: 'https://www.gabia.com/' },
  { id: 'static-43', title: '후이즈 (도메인/호스팅)', desc: '국내 최고 수준의 도메인 등록 및 기업 호스팅', category: '디자인·제작 툴', keywords: ['후이즈', '도메인', '호스팅', '웹사이트', '제작', '기업메일'], url: 'https://www.whois.co.kr/' },

  // 필수 실무 링크 (안내/접수용 사이트 연결)
  { id: 'static-44', title: '국세청 홈택스 (세금신고/전자세금계산서)', desc: '부가가치세·종합소득세 신고 및 사업자등록·세금계산서 발행', category: '필수 실무 링크', keywords: ['홈택스', '국세청', '세금', '부가세', '종합소득세', '전자세금계산서', '사업자등록', '현금영수증'], url: 'https://www.hometax.go.kr/' },
  { id: 'static-24', title: '정부24 (각종 민원/증명서 발급)', desc: '사업자등록증명·민원 서류 발급', category: '필수 실무 링크', keywords: ['정부24', '민원24', '민원', '증명서', '등본', '행정'], url: 'https://www.gov.kr/' },
  { id: 'static-25', title: '식품안전나라 (식품/위생 관련)', desc: '위생교육 및 식품 안전 허가', category: '필수 실무 링크', keywords: ['식품안전나라', '식품', '위생', '식약처', '영업신고'], url: 'https://www.foodsafetykorea.go.kr/' },
  { id: 'static-26', title: '세움터 (건축물대장/용도변경 등)', desc: '건축물대장 열람 및 용도변경 신청', category: '필수 실무 링크', keywords: ['세움터', '건축물대장', '건축', '용도변경', '건축행정'], url: 'https://cloud.eais.go.kr/' },
  { id: 'static-4', title: '보건증(건강진단결과서) 발급 안내', desc: '외식업 종사자 필수 건강진단 서류', category: '필수 실무 링크', keywords: ['보건증', '건강진단', '건강진단결과서'], url: 'https://www.gov.kr/portal/service/serviceInfo/135200000129' },
  { id: 'static-16', title: '4대보험통합징수포털', desc: '직원 및 알바생 4대보험 신고/납부', category: '필수 실무 링크', keywords: ['4대보험', '사대보험', '통합징수포털', '국민건강보험'], url: 'https://si4n.nhis.or.kr/jpza/JpZaa00101.do' },
  { id: 'static-40', title: '통신판매업 신고', desc: '온라인 판매 및 스마트스토어 필수 행정 절차', category: '필수 실무 링크', keywords: ['통신판매업', '통신판매', '신고', '정부24', '온라인판매', '쇼핑몰'], url: 'https://www.gov.kr/main?a=AA020InfoCappViewApp&HighCtgCD=A09006&CappBizCD=11300000006' },
  { id: 'static-41', title: '인터넷등기소 (법인등기 등)', desc: '부동산 및 법인 등기부등본 열람·발급', category: '필수 실무 링크', keywords: ['인터넷등기소', '등기소', '법인등기', '등기부등본', '부동산등기'], url: 'https://www.iros.go.kr/index.jsp' },
  
  // 포장·패키지 (포장재·부자재 등)
  { id: 'static-45', title: '경일포장 (베이커리·종합 포장재 쇼핑몰)', desc: '케이크·제과 상자, 포장용기, 비닐 등 다양한 포장재료 전문 쇼핑몰', category: '포장·패키지', keywords: ['경일포장', '포장', '패키지', '포장·패키지', '포장재', '포장재료', '베이커리포장', '케이크상자', '박스', '상자', '포장용기', '쇼핑몰', '추천쇼핑몰', '재료'], url: 'https://www.kyungilpack.co.kr/' },
  { id: 'static-46', title: '새로피엔엘 (베이킹·선물·종합 포장용품 쇼핑몰)', desc: '베이킹·떡·답례품 포장, 맞춤박스, 테이크아웃 용기 등 포장 전문 쇼핑몰', category: '포장·패키지', keywords: ['새로피엔엘', '포장', '패키지', '포장·패키지', '포장용품', '포장재', '포장재료', '베이킹포장', '떡포장', '맞춤박스', '테이크아웃', '선물포장', '쇼핑몰', '추천쇼핑몰'], url: 'https://www.saeropnl.com/' },
  { id: 'static-47', title: '나비꽃자재 (플라워·리본·포장 부자재 쇼핑몰)', desc: '꽃 포장지, 바구니, 장식·인쇄 리본, 쇼핑백·용돈박스, 조화 등 꽃·포장 자재 쇼핑몰', category: '포장·패키지', keywords: ['나비꽃자재', '포장', '패키지', '포장·패키지', '꽃자재', '꽃포장지', '리본', '장식리본', '바구니', '쇼핑백', '용돈박스', '비누꽃', '조화', '부자재', '포장재', '쇼핑몰', '추천쇼핑몰'], url: 'https://nvflower.com/' },
  { id: 'static-48', title: '포장일번지 (투명케이스·봉투·지퍼백 전문 쇼핑몰)', desc: '투명케이스·원통, OPP·택배 비닐봉투, 지퍼백, 복주머니·부직포가방 등 포장 전문 쇼핑몰', category: '포장·패키지', keywords: ['포장일번지', '포장', '패키지', '포장·패키지', '투명케이스', '원통', '지관통', '비닐봉투', 'OPP봉투', '택배봉투', '지퍼백', '복주머니', '부직포가방', '포장재', '쇼핑몰', '추천쇼핑몰'], url: 'https://pojang1st.com/' },
  { id: 'static-49', title: '핑거데이 (스티커·케이크픽·포장 인쇄디자인 쇼핑몰)', desc: '주문제작 스티커, 케이크픽, 시즌 포장재·상자 등 감각적인 인쇄디자인 쇼핑몰', category: '포장·패키지', keywords: ['핑거데이', '포장', '패키지', '포장·패키지', '스티커', '주문제작스티커', '케이크픽', '택', '인쇄디자인', '포장재', '상자', '쇼핑몰', '추천쇼핑몰'], url: 'https://www.fingerday.co.kr/' },
  { id: 'static-50', title: '신식상점 (친환경·수입지·인쇄 종이 전문 쇼핑몰)', desc: '친환경 인증 종이, 수입지, 포장·인쇄용 특수지 및 주문제작·인쇄 전문 쇼핑몰', category: '포장·패키지', keywords: ['신식상점', '포장', '패키지', '포장·패키지', '종이', '친환경종이', '수입지', '특수지', '포장지', '인쇄', '종이쇼핑몰', '쇼핑몰', '추천쇼핑몰'], url: 'https://sinsic.co.kr/' },
  { id: 'static-51', title: '헬로우모리스 (선물상자·쇼핑백·감성 포장 쇼핑몰)', desc: '베이킹·선물상자, 쇼핑백, 포장지, 스티커·선물택, 리본·끈 등 감성 포장 디자인 쇼핑몰', category: '포장·패키지', keywords: ['헬로우모리스', '포장', '패키지', '포장·패키지', '선물상자', '쇼핑백', '포장지', '스티커', '선물택', '띠종이', '리본', '베이킹포장', '포장재', '쇼핑몰', '추천쇼핑몰'], url: 'https://hellomoris.com/' },
  { id: 'static-74', title: '공방툴닷컴 (공방·베이킹 포장비닐·전용도구 스토어)', desc: '도라지정과·오란다·디저트 전용 접착 OPP 포장봉투 및 칼각오란다틀·버터소분틀 등 베이킹 공방 전문 스토어', category: '포장·패키지', keywords: ['공방툴닷컴', 'BK디자인', 'bk_design', '포장', '패키지', '포장·패키지', '도라지정과포장', '오란다포장', 'OPP봉투', '접착봉투', '포장비닐', '답례품포장', '오란다틀', '버터소분틀', '베이킹도구', '공방도구', '스마트스토어'], url: 'https://smartstore.naver.com/bk_design' },
  { id: 'static-75', title: '골드프린터 (꽃집·포장 리본프린터·공단리본·스티커 스토어)', desc: '공단리본 금·은박 출력 꽃집·선물포장 리본프린터 및 전용 감열리본·스티커 전문 스토어', category: '포장·패키지', keywords: ['골드프린터', 'Gold printer', 'goldprinter', '포장', '패키지', '포장·패키지', '리본프린터', '공단리본', '인쇄리본', '꽃집리본', '포장리본', '감열리본', '금박리본', '스티커프린터', '스마트스토어'], url: 'https://smartstore.naver.com/goldprinter' },

  // 식자재·식품 (업소용 식자재·농수축산물·식품 도소매 쇼핑몰)
  { id: 'static-70', title: '그린팜 (특수야채·샐러드·신선채소 식자재 쇼핑몰)', desc: '샐러드 채소, 허브, 식용꽃, 업소용 특수야채 및 신선 농산물 도소매 전문 쇼핑몰', category: '식자재·식품', keywords: ['그린팜', '식자재', '식품', '식자재·식품', '특수야채', '샐러드채소', '허브', '식용꽃', '채소', '야채', '농산물', '가락시장', '업소용식자재'], url: 'https://www.grfarm.co.kr/index.html' },
  { id: 'static-71', title: '금천미트 (업소용 축산물·정육 도매 쇼핑몰)', desc: '한우, 한돈, 수입육(소·돼지·닭·양고기) 및 육가공품 사업자 전문 도매 플랫폼', category: '식자재·식품', keywords: ['금천미트', '식자재', '식품', '식자재·식품', '축산물', '정육', '고기', '한우', '한돈', '수입육', '소고기', '돼지고기', '닭고기', '육가공', '업소용식자재', '도매'], url: 'https://www.ekcm.co.kr/' },
  { id: 'static-72', title: '간편한식 (육수·농축액·소스·즉석조리식품 쇼핑몰)', desc: '사골농축액·사골분말, 치킨스톡·본스톡, 비빔·불맛·냉면소스 및 국·탕 즉석조리식품 전문 쇼핑몰', category: '식자재·식품', keywords: ['간편한식', '신영몰', '에프비신영', '신영에이치에스', '식자재', '식품', '식자재·식품', '사골농축액', '사골분말', '치킨스톡', '본스톡', '육수', '소스', '양념장', '즉석조리식품', '업소용소스'], url: 'https://shinyoungmall.co.kr/' },
  { id: 'static-73', title: '머쉬러브 (산지직송 프리미엄·특수버섯 전문 쇼핑몰)', desc: '노루궁뎅이버섯, 고기느타리버섯, 특수버섯, 손질버섯·건버섯 등 산지 수확 버섯 전문 쇼핑몰', category: '식자재·식품', keywords: ['머쉬러브', '식자재', '식품', '식자재·식품', '버섯', '특수버섯', '손질버섯', '건버섯', '노루궁뎅이버섯', '느타리버섯', '고기느타리버섯', '산지버섯', '농산물', '업소용버섯'], url: 'https://mushlove.co.kr/' },
  { id: 'static-76', title: '푸드팡 (업소용 농·수·축산물 식자재 도매·새벽배송 플랫폼)', desc: '도매시장 직사입 신선 채소·과일·축수산물·공산품 식당 전문 식자재 유통 및 새벽배송 플랫폼', category: '식자재·식품', keywords: ['푸드팡', 'foodpang', '식자재', '식품', '식자재·식품', '업소용식자재', '식당식자재', '도매시장', '농산물', '채소', '야채', '수산물', '축산물', '공산품', '식자재유통', '새벽배송'], url: 'https://foodpang.co/products?local_office_id=1' },
  { id: 'static-77', title: '식자재왕몰 (e왕마트 업소용 종합 식자재 도매몰)', desc: '사조푸디스트 운영 대용량 업소용 식자재·농수축산물·소스·공산품 사업자 전문 도매 쇼핑몰', category: '식자재·식품', keywords: ['식자재왕몰', '식자재왕', '이왕마트', 'e왕마트', 'ewangmart', '사조푸디스트', '식자재', '식품', '식자재·식품', '업소용식자재', '대용량식자재', '도매마트', '식당식자재'], url: 'https://www.ewangmart.com/' },

  // 매장 렌털·케어 (보안·방역·정수기·가전 렌탈)
  { id: 'static-52', title: '캡스 (SK쉴더스 매장 보안·CCTV)', desc: '무인경비, 지능형 CCTV, 출입통제 등 매장 통합 보안 서비스', category: '매장 렌털·케어', keywords: ['캡스', 'ADT캡스', 'SK쉴더스', '보안', 'CCTV', '무인경비', '방범', '매장보안', '렌탈', '렌털', '케어'], url: 'https://www.skshieldus.com/' },
  { id: 'static-53', title: '세스코 (매장 해충방제·위생케어)', desc: '음식점·사업장 통합 해충방제, 바이러스 케어 및 식품안전 위생 관리', category: '매장 렌털·케어', keywords: ['세스코', 'cesco', '방역', '해충방제', '소독', '위생', '매장케어', '렌탈', '렌털', '케어'], url: 'https://www.cesco.co.kr/' },
  { id: 'static-54', title: '코웨이 (정수기·공기청정기·비데 렌탈)', desc: '매장·업소용 대용량 정수기, 얼음정수기, 공기청정기, 비데 렌탈 및 케어', category: '매장 렌털·케어', keywords: ['코웨이', 'coway', '정수기', '얼음정수기', '공기청정기', '비데', '업소용정수기', '렌탈', '렌털', '케어'], url: 'https://www.coway.com/' },
  { id: 'static-55', title: '청호나이스 (얼음정수기·매장 가전 렌탈)', desc: '얼음정수기, 업소용 정수기, 공기청정기, 제빙기 등 가전 렌탈 및 관리', category: '매장 렌털·케어', keywords: ['청호나이스', '청호', '정수기', '얼음정수기', '제빙기', '공기청정기', '렌탈', '렌털', '케어'], url: 'https://www.chungho.co.kr/' },
  { id: 'static-56', title: '쿠쿠 (정수기·제빙기·생활가전 렌탈)', desc: '직수·얼음정수기, 업소용 제빙기, 공기청정기, 비데 등 매장 가전 렌탈', category: '매장 렌털·케어', keywords: ['쿠쿠', 'cuckoo', '쿠쿠홈시스', '정수기', '얼음정수기', '제빙기', '공기청정기', '비데', '렌탈', '렌털', '케어'], url: 'https://www.cuckoo.co.kr/' },
  { id: 'static-57', title: '에스원 (세콤 매장 보안·CCTV)', desc: '세콤 출동경비, 매장 CCTV, 무인매장 보안 솔루션', category: '매장 렌털·케어', keywords: ['에스원', '세콤', 'secom', '보안', 'CCTV', '경비', '무인매장', '렌탈', '렌털', '케어'], url: 'https://www.s1.co.kr/' },
  { id: 'static-58', title: 'SK매직 (정수기·식기세척기·가전 렌탈)', desc: '정수기, 공기청정기, 식기세척기 등 매장·사업장 가전 렌탈 케어', category: '매장 렌털·케어', keywords: ['SK매직', '정수기', '식기세척기', '공기청정기', '비데', '렌탈', '렌털', '케어'], url: 'https://www.skmagic.com/' },
  { id: 'static-68', title: '하우스쿡 (IH 정수조리기·스마트프라이어·상업용 주방가전)', desc: '업소용·멀티형 IH 정수조리기(라면조리기), 스마트프라이어 등 매장 주방가전 솔루션', category: '매장 렌털·케어', keywords: ['하우스쿡', 'hauscook', '정수조리기', '라면조리기', '인덕션', '스마트프라이어', '튀김기', '업소용조리기', '주방가전', '렌탈', '렌털', '케어'], url: 'https://hauscook.com/' },

  // 간판·현수막 제작 (지역별 전문 업체)
  { id: 'static-60', region: '서울', title: '아우어사인서울 (맞춤 디자인 간판·사인물 제작)', desc: '감각적인 매장 맞춤 디자인 간판, 네온·LED·채널간판 및 사인물 전문 제작·시공', category: '간판·현수막 제작', keywords: ['서울', '서울간판', '아우어사인서울', '아우어사인', '우리간판', '디자인간판', '간판', '네온사인', 'LED간판', '채널간판', '사인물', '간판제작', '현수막'], url: 'https://blog.naver.com/oursignneon' },
  { id: 'static-61', region: '경기남부', title: '간판대장 수원본점 (수원·안산·안양 간판·아웃테리어)', desc: '매장 컨셉·상권 맞춤 간판 컨설팅, 카페·병원·매장 간판 디자인 및 아웃테리어 시공', category: '간판·현수막 제작', keywords: ['경기남부', '경기', '경기도', '수원', '안산', '안양', '간판대장', '수원간판', '간판', '디자인간판', '아웃테리어', '간판제작', '현수막'], url: 'https://blog.naver.com/lim38383' },
  { id: 'static-62', region: '인천', title: '우리동네 착한간판 (인천 간판·현수막·사인물 제작)', desc: '합리적인 비용의 매장 맞춤 LED·채널·플렉스 간판, 현수막 및 사인물 제작·시공', category: '간판·현수막 제작', keywords: ['인천', '인천간판', '우리동네착한간판', '착한간판', '간판', 'LED간판', '채널간판', '플렉스간판', '현수막', '사인물', '간판제작'], url: 'https://blog.naver.com/kindsign' },
  { id: 'static-64', region: '대전', title: '하우광고디자인 (대전 간판·현수막·광고물 제작)', desc: 'LED·채널간판, 현수막, 실사출력, 옥외광고물 등 매장 맞춤 디자인·시공', category: '간판·현수막 제작', keywords: ['대전', '대전간판', '하우광고디자인', '하우광고', '간판', '현수막', 'LED간판', '채널간판', '실사출력', '옥외광고', '간판제작', '현수막제작'], url: 'https://blog.naver.com/how1325' },
  { id: 'static-63', region: '충남', title: '애드원광고 (천안·충남 간판·현수막·인쇄물 제작)', desc: '간판, 현수막, 인쇄물, 상패·기념품 등 충남 종합 광고기획 및 맞춤 제작·시공', category: '간판·현수막 제작', keywords: ['충남', '충청남도', '천안', '천안간판', '애드원광고', '간판', '현수막', '인쇄', '전단지', '명함', '상패', '기념품', '간판제작', '현수막제작'], url: 'https://blog.naver.com/adone1163' },
  { id: 'static-67', region: '전북', title: '구륙브랜딩 (전주·전북 간판 디자인·인테리어 시공)', desc: '매장 브랜딩 맞춤 감성 간판 디자인, 사인물 및 인테리어 제작·시공', category: '간판·현수막 제작', keywords: ['전북', '전라북도', '전주', '전주간판', '구륙브랜딩', '96브랜딩', '간판', '현수막', '디자인간판', '브랜딩', '사인물', '인테리어', '간판제작'], url: 'https://blog.naver.com/96branding' },
  { id: 'static-69', region: '전남', title: '한일디자인 (목포·전남 간판·현수막·옥외광고 디자인)', desc: 'LED·채널간판, 현수막, 옥외광고물 및 기업·매장 맞춤 디자인·시공', category: '간판·현수막 제작', keywords: ['전남', '전라남도', '목포', '목포간판', '한일디자인', '목포한일디자인', '간판', '현수막', '옥외광고', '디자인간판', '간판제작', '현수막제작'], url: 'https://blog.naver.com/inho116' },
  { id: 'static-59', region: '강원도', title: '싸인플러스 (춘천·강원 간판·현수막 제작)', desc: 'LED·채널·플렉스·나무·에어간판, 현수막, 전단지, 명함, 아크릴 맞춤 제작·시공', category: '간판·현수막 제작', keywords: ['강원도', '강원', '춘천', '춘천간판', '싸인플러스', '간판', '현수막', 'LED간판', '채널간판', '나무간판', '에어간판', '전단지', '명함', '아크릴', '간판제작', '현수막제작'], url: 'https://blog.naver.com/wkhn8325' },
  { id: 'static-66', region: '부산', title: '대한애드 (부산 간판·POP·아크릴·실사출력 제작)', desc: 'LED 채널간판 시공, UV 실사출력, POP 사인물, 아크릴·레이저가공 맞춤 제작', category: '간판·현수막 제작', keywords: ['부산', '부산간판', '대한애드', '주식회사대한애드', '간판', '현수막', 'POP', '아크릴', 'UV출력', '실사출력', 'LED간판', '채널간판', '사인물', '간판제작'], url: 'https://blog.naver.com/dhad1641' },
  { id: 'static-65', region: '경남', title: '전진광고 (창원·경남 간판·현수막·사인물 제작)', desc: 'LED·채널·플렉스 간판, 현수막, 옥외광고물 등 매장 맞춤 제작·시공', category: '간판·현수막 제작', keywords: ['경남', '경상남도', '창원', '창원간판', '전진광고', '전진종합광고사', '간판', '현수막', 'LED간판', '채널간판', '사인물', '간판제작', '현수막제작'], url: 'https://blog.naver.com/jeonjinsign' },

  // 매장관리 추천앱
  { id: 'static-33', title: '한고세쏙 (일상 기록/정산 관리)', desc: '계좌, 구독, 돈거래 등 흩어진 내 정보를 한곳에', category: '매장관리 추천앱', keywords: ['한고세쏙', '기록', '메모', '장부', '정산', '일정', '관리앱', '추천앱', '매장관리 추천앱'], url: 'https://hangose-me.vercel.app/landing.html' },
  { id: 'static-34', title: '당근비즈니스 (동네 홍보)', desc: '우리 동네 단골 만들기 및 매장 지역 광고', category: '매장관리 추천앱', keywords: ['당근', '당근마켓', '비즈니스', '광고', '홍보', '추천앱', '매장관리 추천앱'], url: 'https://business.daangn.com/' },
  { id: 'static-35', title: '노션 (매장 관리/업무 협업)', desc: '매장 매뉴얼, 직원 교대 일지 등 체계적인 업무 관리', category: '매장관리 추천앱', keywords: ['노션', 'notion', '매장관리', '매뉴얼', '협업', '업무', '추천앱'], url: 'https://www.notion.so/ko-kr' },
];

const PROMO_BANNERS = [
  {
    id: 'ssakdaform',
    badge: '추천',
    badgeClass: 'bg-amber-300 text-indigo-950',
    title: '복잡한 주문·예약·알바 이력서는 그만! ✨',
    subtitle: '링크 하나로 스마트하게 접수받고, 노쇼와 악성 알바 리스크까지 싹 다 방어하세요.',
    buttonText: '내 매장 전용 폼 만들기 →',
    url: 'https://ssakdaform-9cqv.vercel.app',
    bgClass: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-indigo-500/30',
    subTextClass: 'text-indigo-100',
    btnClass: 'bg-white text-indigo-700 group-hover:bg-indigo-50',
  },
  {
    id: 'nao3',
    badge: '문자비 0원',
    badgeClass: 'bg-yellow-300 text-[#5F0080]',
    title: '라이브 홈쇼핑을 내 매장으로! 매출 폭발 1초 전단지 🚀',
    subtitle: '비싼 문자비 평생 0원! 3초 세일 등록과 실시간 품절 푸시 알림으로 단골 지갑을 여세요.',
    buttonText: '1초 모바일 전단지 무료 체험 →',
    url: 'https://nao3.vercel.app/',
    bgClass: 'bg-gradient-to-r from-[#5F0080] via-purple-800 to-fuchsia-800 hover:from-[#4a0063] hover:to-fuchsia-900 border-purple-500/30',
    subTextClass: 'text-purple-100',
    btnClass: 'bg-yellow-400 text-purple-950 group-hover:bg-yellow-300',
  },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [hangoseUrl, setHangoseUrl] = useState('https://hangose-me.vercel.app/landing.html');
  const [dbForms, setDbForms] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  // 한국 시간(KST) 날짜를 기준으로 매일 500 ~ 3,000명 사이에서 큰 폭으로 변동하는 고유 기본값 계산 함수
  const getDailyBaseCount = () => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const dateStr = kst.toISOString().split('T')[0]; // YYYY-MM-DD
    let h = 2166136261;
    for (let i = 0; i < dateStr.length; i++) {
      h ^= dateStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // 날짜 끝자리 1일 차이에도 숫자가 완전히 불규칙하게(예: 653 -> 1520 -> 2740) 바뀌도록 비트 믹싱
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return 500 + (Math.abs(h) % 2501); // 매일 500 ~ 3,000명 사이로 설정
  };

  const [dailyVisitorCount, setDailyVisitorCount] = useState<number>(() => getDailyBaseCount());

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) return;

      // Vercel 환경변수에 추가될 Public Key 우선 사용
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BPSIMaexeMfcpWWslN3VpLDVWJVWJqvQvfG2y14bWM6Fu6IegevXAhVOFZ5_4T_ZpjYyEAuckPVyZuPoeeGYJgo';
      const convertedKey = urlB64ToUint8Array(vapidKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      const subObj = subscription.toJSON();
      
      await supabase.from('ssakdamoa_push_subscribers').insert([{
        endpoint: subObj.endpoint,
        p256dh: subObj.keys?.p256dh,
        auth: subObj.keys?.auth
      }]);
    } catch (err) {
      console.error('푸시 구독 실패:', err);
    }
  };

  // PWA 앱 설치 프롬프트 및 모바일(iOS/Android) 감지
  useEffect(() => {
    // Service Worker 등록 및 푸시 알림 확인
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        // 앱으로 실행 중인지(standalone) 확인하여, 앱 사용자면 푸시 구독 시도
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) {
          setTimeout(subscribeToPush, 2000); // 사용자 방해되지 않게 약간 지연
        }
      }).catch(err => console.log('SW err:', err));
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // 브라우저가 지원할 때 (PC 크롬, 안드로이드 크롬 등)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        
        // 앱 설치 통계 기록 (비동기)
        try {
          const ua = navigator.userAgent.toLowerCase();
          const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
          const platform = isMobile ? 'Mobile Web' : 'PC Web';
          
          await supabase.from('ssakdamoa_analytics').insert([{
            path: 'APP_INSTALL',
            referrer: `[${platform}] 홈 화면 추가 버튼`,
            is_instagram: false,
            visited_at: new Date().toISOString()
          }]);

          // 설치 허용 시 알림 권한도 연이어 요청
          await subscribeToPush();
        } catch (e) {
          console.error('Failed to log install event or subscribe push', e);
        }
      }
    } else {
      // 팝업이 차단되는 환경(카카오톡 인앱, 아이폰 등)에서 버튼이 '먹통'처럼 느껴지지 않게 예외 처리
      const ua = navigator.userAgent.toLowerCase();
      
      if (ua.includes('kakaotalk')) {
        // 카카오톡 내부에선 외부 브라우저(크롬/사파리)로 강제 연결
        window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(window.location.href);
      } else if (/iphone|ipad|ipod/.test(ua)) {
        alert('애플 정책상 아이폰은 사파리(Safari) 브라우저 하단의 [공유] 버튼을 통해서만 설치할 수 있습니다.');
      } else {
        alert('이미 앱이 바탕화면에 설치되어 있거나, 현재 환경에서 설치 기능을 지원하지 않습니다.\n(크롬이나 삼성 인터넷 앱을 이용해주세요!)');
      }
    }
  };

  // 검색어나 카테고리가 변경되면 표시 개수를 다시 10개로 초기화
  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory, searchTerm]);

  // 방문자 통계 기록 및 디바이스 체크
  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
      setHangoseUrl('https://hangose-me.vercel.app/m_landing.html');
    }

    // 통계 기록 (로컬호스트, 자동화 봇, 관리자 기기 및 중복 카운트 완벽 차단)
    const trackVisit = async () => {
      try {
        // 1. 로컬 개발 환경(localhost 등) 접속은 통계에서 제외
        const host = window.location.hostname;
        if (
          host === 'localhost' ||
          host === '127.0.0.1' ||
          host.startsWith('192.168.') ||
          host.endsWith('.local')
        ) {
          return;
        }

        // 2. Vercel 배포 캡처 봇, 검색엔진 크롤러, 헤드리스 브라우저 제외
        const ua = navigator.userAgent.toLowerCase();
        const isBot =
          navigator.webdriver === true ||
          /bot|crawler|spider|headless|vercel|lighthouse|prerender|phantomjs|slurp|facebookexternalhit|kakaotalk-scrap|yeti|googlebot|bingbot|daumoa| screenshot/i.test(ua);
        if (isBot) return;

        // 3. 관리자(/admin 로그인 이력이 있는 사장님 브라우저) 접속은 통계에서 제외
        if (localStorage.getItem('admin_pin')) return;

        // 4. 전역 윈도우 플래그로 동시 실행(React StrictMode 2중 실행 등) 즉시 차단
        if ((window as any).__ssakdamoa_visit_tracked) return;

        // 날짜 포맷팅 에러 방지를 위해 수동으로 KST(한국 시간) YYYY-MM-DD 문자열 생성
        const now = new Date();
        const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const today = kstNow.toISOString().split('T')[0];
        
        const visitedToday = localStorage.getItem('ssakdamoa_visited_today');
        const sessionVisited = sessionStorage.getItem('ssakdamoa_visited_session');

        // 5. 현재 창(탭)에서 이미 기록했다면 즉시 차단 (새로고침 무한 카운트 방지)
        if (sessionVisited) return;
        
        // 6. 오늘 하루 이미 기록했다면 즉시 차단 (브라우저 재실행 카운트 방지)
        if (visitedToday === today) return;

        // 통과했다면 즉시 메모리·로컬·세션 스토리지에 못 박음 (네트워크 지연 중 중복 실행 방지)
        (window as any).__ssakdamoa_visit_tracked = true;
        sessionStorage.setItem('ssakdamoa_visited_session', 'true');
        localStorage.setItem('ssakdamoa_visited_today', today);

        const rawReferrer = document.referrer;
        
        // 접속 기기(환경) 판별
        const isMobileDevice = /mobile|android|iphone|ipad|ipod/i.test(ua);
        const platform = isMobileDevice ? 'Mobile Web' : 'PC Web';

        // 유입 출처 판별 (인앱 브라우저 우선 체크)
        let source = rawReferrer || 'Direct';
        let isInstagram = false;

        if (ua.includes('instagram') || rawReferrer.includes('instagram.com') || rawReferrer.includes('l.instagram.com')) {
          source = 'Instagram';
          isInstagram = true;
        } else if (ua.includes('kakaotalk')) {
          source = 'KakaoTalk';
        } else if (ua.includes('naver')) {
          source = 'Naver App';
        } else if (rawReferrer.includes('naver.com')) {
          source = 'Naver 검색';
        } else if (rawReferrer.includes('google.com')) {
          source = 'Google 검색';
        } else if (rawReferrer.includes('daum.net')) {
          source = 'Daum 검색';
        } else if (source === 'Direct') {
          source = '직접 접속 (Direct)';
        }

        const finalReferrer = `[${platform}] ${source}`;
        const path = window.location.pathname;

        // DB에 조용히 비동기 기록
        await supabase.from('ssakdamoa_analytics').insert([{ 
          referrer: finalReferrer, 
          is_instagram: isInstagram, 
          path 
        }]);
      } catch (err) {
        console.error('Failed to track visit', err);
      } finally {
        // 오늘 기본 설정값(2,120~2,920명) + 실제 DB에 집계된 오늘 방문자 수를 합산하여 실시간 반영
        const baseCount = getDailyBaseCount();
        setDailyVisitorCount(baseCount);
        const realCount = await fetchPublicTodayVisitorCount();
        setDailyVisitorCount(baseCount + realCount);
      }
    };
    trackVisit();
  }, []);

  // Supabase에서 동적 폼(실무 서식) 데이터 불러오기
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data, error } = await supabase
          .from('ssakdamoa_forms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          const formattedForms = data.map(form => ({
            id: form.id,
            title: form.title,
            desc: form.description,
            category: '실무 서식·양식',
            keywords: [form.title, '다운로드', '서식', '양식'],
            url: form.file_url,
            isDbForm: true,
          }));
          setDbForms(formattedForms);
        }
      } catch (err) {
        console.error('Failed to fetch forms from Supabase', err);
      }
    };
    fetchForms();
  }, []);

  const handleFormDownload = async (e: React.MouseEvent<HTMLButtonElement>, formId: string, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 1. 새 창이 아닌 '강제 파일 다운로드' 모드로 실행
    const forceDownloadUrl = url + (url.includes('?') ? '&' : '?') + 'download=';
    const link = document.createElement('a');
    link.href = forceDownloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 2. 백그라운드에서 다운로드 수 증가 (실제 다운로드 버튼을 눌렀을 때만!)
    try {
      const { data } = await supabase.from('ssakdamoa_forms').select('downloads').eq('id', formId).single();
      if (data) {
        await supabase.from('ssakdamoa_forms').update({ downloads: data.downloads + 1 }).eq('id', formId);
      }
    } catch (err) {
      console.error('Failed to increment download count', err);
    }
  };

  // 정적 링크와 동적 서식 링크 결합
  const ALL_LINKS = [...STATIC_LINKS, ...dbForms];

  // 향상된 검색 및 필터링 로직
  const filteredLinks = ALL_LINKS.filter(link => {
    const term = searchTerm.trim().toLowerCase().replace(/\s+/g, '');
    
    if (term) {
      const title = link.title.toLowerCase().replace(/\s+/g, '');
      return title.includes(term) || link.keywords.some((kw: string) => kw.toLowerCase().replace(/\s+/g, '').includes(term));
    }
    
    return selectedCategory === '전체' || link.category === selectedCategory;
  });

  // 화면에 렌더링할 10개 이하의 링크만 잘라내기
  const displayedLinks = filteredLinks.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 pb-28 px-4 font-sans">
      {/* Header */}
      <div className="w-full max-w-2xl text-center mb-5">
        <div className="flex justify-end mb-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-100/80 border border-gray-200/60 px-2.5 py-0.5 rounded-full font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400/70"></span>
            오늘 방문자 <span className="font-semibold text-gray-500">{dailyVisitorCount.toLocaleString()}</span>명
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2 tracking-tight">싹다모아</h1>
        <p className="text-gray-500 text-sm mb-4">자영업자 필수 링크 & 서식 종합 허브</p>
        <button 
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-2 px-4 rounded-full text-[13px] transition-colors border border-blue-100 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          홈 화면에 앱 추가하기 (1초 설치)
        </button>
      </div>

      {/* 상단 프로모션 슬라이드 배너 (나중에 어플 완성 후 공개 시 false를 true로 변경) */}
      {false && (
      <div className="w-full max-w-2xl mb-5 relative">
        <div className="overflow-hidden rounded-2xl shadow-md">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
          >
            {PROMO_BANNERS.map((banner) => (
              <a 
                key={banner.id}
                href={banner.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full shrink-0 ${banner.bgClass} p-4 sm:px-5 sm:py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors group border`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${banner.badgeClass} text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0`}>
                      {banner.badge}
                    </span>
                    <h3 className="text-sm sm:text-[15px] font-extrabold tracking-tight text-white">
                      {banner.title}
                    </h3>
                  </div>
                  <p className={`${banner.subTextClass} text-xs leading-relaxed break-keep`}>
                    {banner.subtitle}
                  </p>
                </div>
                <div className={`shrink-0 ${banner.btnClass} font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors text-center whitespace-nowrap`}>
                  {banner.buttonText}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 슬라이드 인디케이터 (점 버튼) */}
        <div className="flex justify-center gap-1.5 mt-2.5">
          {PROMO_BANNERS.map((banner, idx) => (
            <button
              key={banner.id}
              onClick={() => setBannerIndex(idx)}
              aria-label={`배너 ${idx + 1} 보기`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                bannerIndex === idx ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
      )}

      {/* Search & Filter Area */}
      <div className="w-full max-w-2xl bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="'보건증', '제로페이', '메뉴판' 등 키워드 검색" 
            className="w-full bg-gray-100 text-gray-800 rounded-xl pl-4 pr-16 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedCategory === '마진 계산기' || selectedCategory === '급여 계산기' || selectedCategory === '통합 송장조회') {
                setSelectedCategory('전체');
              }
            }}
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-2">
            {searchTerm.length > 0 && (
              <button 
                onClick={() => setSearchTerm('')}
                className="w-5 h-5 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-white rounded-full text-xs transition-colors"
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
            <span className="text-gray-400 text-lg mr-1">🔍</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pb-1">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[13px] sm:text-sm font-semibold transition-colors ${
                selectedCategory === category && !searchTerm
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-2xl flex flex-col gap-2.5">
        {selectedCategory === '마진 계산기' ? (
          <Calculator />
        ) : selectedCategory === '급여 계산기' ? (
          <WageCalculator />
        ) : selectedCategory === '통합 송장조회' ? (
          <ParcelTracker />
        ) : displayedLinks.length > 0 ? (
          displayedLinks.map(link => {
            const currentUrl = link.id === 'static-33' ? hangoseUrl : link.url;
            
            // DB 서식인 경우: 미리보기(좌측)와 다운로드(우측 버튼)를 분리
            if (link.isDbForm) {
              return (
                <div 
                  key={link.id} 
                  className="w-full bg-white text-gray-800 py-3 px-4 rounded-xl border border-gray-200 font-medium transition-all text-left flex justify-between items-center shadow-sm hover:shadow"
                >
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-1 flex-1 cursor-pointer group pr-4"
                  >
                    <span className="text-[15px] leading-tight group-hover:text-blue-600 transition-colors">{link.title}</span>
                    <span className="text-xs text-blue-500 font-medium">{link.desc}</span>
                  </a>
                  <button
                    onClick={(e) => handleFormDownload(e, link.id, link.url)}
                    className="flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-500 w-11 h-11 rounded-xl transition-colors shrink-0"
                    title="파일 강제 다운로드"
                  >
                    ↓
                  </button>
                </div>
              );
            }

            // 일반 링크인 경우 (기존 유지 + 지역 뱃지 지원)
            return (
              <a 
                key={link.id} 
                href={currentUrl}
                target={currentUrl === '#' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-gray-50 text-gray-800 py-3.5 px-5 rounded-xl border border-gray-200 font-medium transition-all text-left flex justify-between items-center group shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {(link as any).region && (
                    <span className="inline-flex items-center justify-center min-w-[84px] px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold shrink-0 shadow-xs">
                      📍 {(link as any).region}
                    </span>
                  )}
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[15px] leading-tight">{link.title}</span>
                    <span className="text-xs text-blue-500 font-medium">{link.desc}</span>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-blue-500 transition-colors text-xl ml-3 shrink-0">
                  {link.category === '실무 서식·양식' ? '↓' : '→'}
                </span>
              </a>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-200">
            검색 결과가 없습니다. 다른 키워드를 입력해보세요!
          </div>
        )}
      </div>

      {/* 더보기 버튼 */}
      {filteredLinks.length > visibleCount && (
        <button 
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="w-full max-w-2xl mt-4 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          더보기 ({visibleCount} / {filteredLinks.length}) ⬇️
        </button>
      )}

      {/* Cross Promotion Banner */}
      <a 
        href={hangoseUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block w-full max-w-2xl mt-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg text-center transform hover:scale-[1.02] transition-transform cursor-pointer"
      >
        <h3 className="text-lg font-extrabold mb-1.5">복잡한 일상 기록, 한곳에 쏙! 🚀</h3>
        <p className="text-green-50 text-sm mb-4">계좌, 구독, 돈거래 장부, 아이디까지 흩어진 내 정보를 직관적으로 관리하세요.</p>
        <div className="inline-block bg-white text-green-700 font-bold py-2.5 px-6 rounded-full hover:bg-green-50 transition-colors shadow-sm text-sm">
          한고세쏙 무료로 시작하기
        </div>
      </a>
      
    </main>
  );
}
