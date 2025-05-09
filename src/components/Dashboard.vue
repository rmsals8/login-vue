<template>
    <div class="dashboard-container">
      <header>
        <h1>사용자 대시보드</h1>
        <p class="welcome-message">어서오세요, <span class="username">{{ username }}</span>님!</p>
      </header>
      
      <div class="dashboard-content">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-title">계정 상태</div>
            <div class="stat-value">정상</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">마지막 로그인</div>
            <div class="stat-value">{{ formattedLoginTime }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">로그인 방식</div>
            <div class="stat-value">{{ loginMethod }}</div>
          </div>
        </div>
        
        <div class="actions-container">
            <h2 style="text-align: center;">빠른 작업</h2>
          <div class="action-buttons">
            <button class="action-btn danger" @click="handleLogout">로그아웃</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    name: 'Dashboard',
    data() {
      return {
        username: '사용자',
        lastLoginTime: new Date(),
        loginMethod: '일반 로그인',
        userData: null
      }
    },
    computed: {
      formattedLoginTime() {
        return this.lastLoginTime.toLocaleString('ko-KR');
      }
    },
    methods: {
      async handleLogout() {
    try {
      // 로딩 상태 설정 (필요한 경우)
      this.isLoading = true;
      
      // API URL 설정
      const apiUrl = process.env.VUE_APP_API_URL || "https://13.209.15.189";
      
      // 백엔드의 /logout 엔드포인트 호출
      await axios.get(`${apiUrl}/logout`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        withCredentials: true  // 쿠키를 포함하여 요청 (리프레시 토큰 쿠키 전송을 위해 필요)
      });
      
      // 로컬 스토리지에서 사용자 정보 및 토큰 제거
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      
      console.log('로그아웃 성공');
      
      // 로그인 페이지로 리다이렉트
      this.$router.push('/');
    } catch (error) {
      console.error('로그아웃 처리 중 오류 발생:', error);
      
      // 오류가 발생하더라도 로컬 스토리지 정보를 삭제하고 로그인 페이지로 이동
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      
      // 에러 메시지 표시 (필요한 경우)
      this.errorMessage = '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.';
      
      // 로그인 페이지로 강제 이동
      this.$router.push('/');
    } finally {
      // 로딩 상태 해제 (필요한 경우)
      this.isLoading = false;
    }
  }
    },
    // Dashboard.vue의 mounted() 메서드에 추가
    // Dashboard.vue의 mounted() 메서드 수정
// Dashboard.vue의 mounted() 메서드 수정
mounted() {
  // URL 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userId = urlParams.get('userId');
  const encodedUsername = urlParams.get('username'); // URL 인코딩된 상태로 받음
  const loginType = urlParams.get('loginType');
  
  console.log('URL 파라미터:', { token, userId, encodedUsername, loginType });
  
  // username 디코딩 (URL 디코딩)
  let username = '';
  try {
    if (encodedUsername) {
      username = decodeURIComponent(encodedUsername);
      console.log('디코딩된 사용자명:', username);
    }
  } catch (e) {
    console.error('사용자명 디코딩 오류:', e);
    username = encodedUsername || ''; // 디코딩 실패 시 인코딩된 값 그대로 사용
  }
  
  // URL에 토큰 정보가 있으면 로컬 스토리지에 저장
  if (token) {
    localStorage.setItem('userToken', token);
    
    // 사용자 정보도 저장
    const userData = {
      userId: userId,
      username: username,
      loginType: loginType || 'normal'
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('사용자 데이터 저장됨:', userData);
    
    // 파라미터 제거를 위해 현재 URL에서 파라미터 부분을 제거하고 히스토리 교체
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
  
  // 오류 메시지 처리
  const error = urlParams.get('error');
  if (error === 'kakao_login_failed') {
    this.errormessage = '카카오 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
  }

  // 로컬 스토리지에서 사용자 데이터 가져오기
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      this.userData = JSON.parse(userDataStr);
      this.username = this.userData.username || '사용자';
      
      // 카카오 로그인인지 확인
      if (this.userData.loginType === 'kakao') {
        this.loginMethod = '카카오 로그인';
      }
    } catch (e) {
      console.error('사용자 데이터 파싱 오류:', e);
    }
  }
  
  // 로그인 시간 설정
  this.lastLoginTime = new Date();
}

  }
  </script>
  
  <style scoped>
  .dashboard-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  header {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  h1 {
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .welcome-message {
    font-size: 1.2rem;
    color: #666;
  }
  
  .username {
    font-weight: bold;
    color: #03c75a;
  }
  
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .stats-container {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .stat-card {
    flex: 1;
    background-color: #f5f6f7;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .stat-title {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
  }
  
  .actions-container {
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  h2 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .action-btn {
    flex: 1;
    min-width: 150px;
    padding: 0.8rem 1.2rem;
    background-color: #f5f6f7;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .action-btn:hover {
    background-color: #e8e8e8;
  }
  
  .action-btn.danger {
    background-color: #ffebee;
    color: #e03131;
  }
  
  .action-btn.danger:hover {
    background-color: #ffcdd2;
  }
  
  @media (max-width: 768px) {
    .stats-container {
      flex-direction: column;
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .action-btn {
      width: 100%;
    }
  }
  </style>