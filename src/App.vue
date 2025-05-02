<template>
  <div id="app">
    <!-- 앱 헤더 추가 -->
    <header>
      <h1>Vue.js - 그냥 배포 테스트</h1>
      <p class="api-info">API URL: {{ apiUrl }}</p>
    </header>
       
        <router-view />
      
  
    
    <!-- 앱 푸터 수정 -->
    <footer>
      <p>환경: {{ currentEnv }} | 클라우드타입으로 배포됨</p>
      <p class="cloudtype-badge">Powered by CloudType</p>
    </footer>
  </div>
</template>

<script>
// 로그인 컴포넌트 가져오기
 

export default {
  // 앱 이름
  name: 'App',
  
  // 컴포넌트 등록
  components: {
  
  },
  
  // 컴포넌트 데이터
  data() {
    return {
      // 현재 환경 정보 (NODE_ENV 환경 변수에서 가져옴)
      currentEnv: process.env.NODE_ENV,
      deployTime: new Date().toLocaleString(),
       apiUrl:  process.env.VUE_APP_API_URL
      
    }
  },
  
  // 컴포넌트가 생성될 때 실행
  created() {
    // 카카오 로그인 리다이렉트 감지 및 처리
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const loginType = urlParams.get('loginType');
    
    // 카카오 로그인 리다이렉트로 판단되는 경우
    if (token && loginType === 'kakao') {
      console.log('카카오 로그인 리다이렉트 감지 (App.vue)');
      
      // 필요한 정보 저장 후 대시보드로 리다이렉트
      const userId = urlParams.get('userId');
      const encodedUsername = urlParams.get('username');
      
      // 사용자명 디코딩
      let username = '';
      try {
        if (encodedUsername) {
          username = decodeURIComponent(encodedUsername);
        }
      } catch (e) {
        console.error('사용자명 디코딩 오류:', e);
        username = encodedUsername || '';
      }
      
      // 정보 저장
      localStorage.setItem('userToken', token);
      localStorage.setItem('userData', JSON.stringify({
        userId: userId,
        username: username,
        loginType: 'kakao'
      }));
      
      console.log('카카오 로그인 정보 저장 완료, 대시보드로 이동합니다.');
      
      // 쿼리스트링 없이 대시보드로 리다이렉트
      this.$router.replace('/dashboard');
    }
  }
}
</script>

<style>
/* 전역 스타일 */
body {
  margin: 1;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f4f8;
}

/* 앱 컨테이너 스타일 */
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  min-height: 100vh;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
}

/* 헤더 스타일 */
header {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  text-align: center;
}

header h1 {
  color: #3a4374;
  font-size: 1.8em;
  margin-bottom: 0.5em;
}

/* 푸터 스타일 */
footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}

.cloudtype-badge {
  background-color: #4f46e5;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 10px;
  font-weight: bold;
}
</style>