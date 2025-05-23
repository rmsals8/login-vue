<template>
  <div class="login-wrapper">
    <header>
        <h1> 로그인 폼 </h1>
    </header>
    
    <!-- 3번 이상 실패 시 상단 오류 메시지 표시 -->
    <div v-if="showCaptcha && loginFailCount >= 3" class="top-error-message">
        아이디(로그인 전화번호, 로그인 전용 아이디), 비밀번호 또는
        자동입력 방지 문자를 잘못 입력했습니다.
        입력하신 내용을 다시 확인해주세요.
    </div>
    
    <form @submit.prevent="handleSubmit">
        <!-- 입력 필드 컨테이너 -->
        <div class="input-container">
            <div class="input-group">
                <!-- 아이디 입력 필드 -->
                <input 
                    id="username" 
                    v-model="loginform.username" 
                    @input="vaildForm" 
                    @focus="usernameFocused = true" 
                    @blur="usernameFocused = false; validateUsername()"
                    required
                />
                <!-- 라벨은 입력 필드 내부에 위치 -->
                <label for="username" :class="{ 'focused': usernameFocused, 'has-value': loginform.username }">아이디</label>
            </div>
            <!-- 구분선 추가 -->
            <div class="divider"></div>
            <div class="input-group">
                <!-- 비밀번호 입력 필드 -->
                <input 
                    id="password" 
                    v-model="loginform.password" 
                    type="password" 
                    @input="vaildForm"
                    @focus="passwordFocused = true" 
                    @blur="passwordFocused = false; validatePassword()"
                    required
                />
                <!-- 라벨은 입력 필드 내부에 위치 -->
                <label for="password" :class="{ 'focused': passwordFocused, 'has-value': loginform.password }">비밀번호</label>
            </div>
        </div>

        <!-- 로그인 유지 체크박스 -->
        <div class="login-options">
          <div class="remember-login">
            <input type="checkbox" id="login-maintain" v-model="loginform.rememberMe">
            <label for="login-maintain" class="checkbox-label">로그인 상태 유지</label>
          </div>
          <div class="ip-security">
            IP보안 <span class="toggle-switch" :class="{ 'on': ipSecurity }" @click="toggleIpSecurity">{{ ipSecurity ? 'ON' : 'OFF' }}</span>
          </div>
        </div>
        
        <!-- 캡차 영역 추가 (별도 컨테이너로 분리) -->
        <div v-if="showCaptcha" class="captcha-wrapper">
            <div class="captcha-content">
                <!-- 캡차 이미지 영역 -->
                <div class="captcha-image-container">
                    <img :src="captchaImageUrl" alt="Captcha 이미지" class="captcha-image" />
                </div>
            </div>
            
            <!-- 캡차 입력 필드 영역 -->
            <div class="captcha-input-container">
                <div class="captcha-input-group">
                    <input 
                        type="text" 
                        v-model="loginform.captcha" 
                        @input="vaildForm" 
                        placeholder="정답을 입력해주세요."
                        class="captcha-input"
                    />
                    <div class="captcha-buttons">
                        <button type="button" @click="refreshCaptcha" class="captcha-button" aria-label="새로고침">
                            <span class="refresh-icon">↻</span>
                        </button>
                    
                    </div>
                </div>
            </div>
            
            <div class="captcha-info">위 문자를 입력해 주세요</div>
        </div>
    
        <button type="submit" :class="{'active': isFormVaild && !isLoading}"
        > {{ isLoading ? '로그인 중...' :'로그인' }}</button>
        
        <!-- 오류 메시지 표시 영역 -->
        <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
        <div v-else-if="passwordError" class="error-message">{{ passwordError }}</div>
        <div v-else-if="captchaError" class="error-message">{{ captchaError }}</div>
        <div v-else-if="errormessage" class="error-message">{{ errormessage }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        
        <!-- 소셜 로그인 버튼 영역 -->
        <div class="social-login-section">
            <div class="divider-with-text">
                <span>또는</span>
            </div>
            <div class="social-login-buttons">
                <button type="button" @click="kakaoLogin" class="kakao-login-btn">
                  <img src="../assets/kakao_login_large_wide.png" alt="카카오 로그인" />
                </button>
            </div>
        </div>
      </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
name: 'LoginForm',
mounted() {
   
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  
  if (error === 'kakao_login_failed') {
    this.errormessage = '카카오 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
  
  // 로그인 실패 횟수가 세션 스토리지에 저장되어 있으면 복원
  const storedFailCount = sessionStorage.getItem('loginFailCount');
  if (storedFailCount) {
    this.loginFailCount = parseInt(storedFailCount);
    if (this.loginFailCount >= 3) {
      this.showCaptcha = true;
      this.refreshCaptcha();
    }
  }
},
data() {
  return {
      loginform:{
          username:'',
          password:'',
          captcha: '', // 캡차 입력값
          rememberMe: false // 로그인 유지 상태
      },
      errormessage: '',
      successMessage: '',
      usernameError: '',
      passwordError: '',
      captchaError: '',
      isLoading: false,
      isFormVaild: false,
      usernameFocused: false, // 아이디 필드 포커스 상태 추적
      passwordFocused: false, // 비밀번호 필드 포커스 상태 추적
      showCaptcha: false, // 기본값은 false로 설정 (로그인 실패 시에만 표시)
      captchaImageUrl: '', // 캡차 이미지 URL
      loginFailCount: 0, // 로그인 실패 횟수
      ipSecurity: false, // IP 보안 상태
  }
},
methods:{
  validateUsername() {
    if (!this.loginform.username && !this.usernameFocused) {
      this.usernameError = "아이디를 입력해 주세요.";
      return false;
    } else {
      this.usernameError = "";
      return true;
    }
  },
  validatePassword() {
    if (!this.loginform.password && !this.passwordFocused) {
      this.passwordError = "비밀번호를 입력해 주세요.";
      return false;
    } else {
      this.passwordError = "";
      return true;
    }
  },
  // 캡차 검증 메서드
  validateCaptcha() {
    if (this.showCaptcha && !this.loginform.captcha) {
      this.captchaError = "자동입력 방지 문자를 입력해 주세요.";
      return false;
    } else {
      this.captchaError = "";
      return true;
    }
  },
  // 캡차 새로고침 메서드
 
  refreshCaptcha() {
  const apiUrl = process.env.VUE_APP_API_URL || "https://13.209.15.189";
  console.log('캡차 새로고침 요청 시작');
  
  axios({
    method: 'get',
    url: `${apiUrl}/api/captcha/image`,
    params: { timestamp: new Date().getTime() },
    withCredentials: true, // 중요: 세션 쿠키 전송
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
  .then(response => {
    console.log('캡차 이미지 로드 성공, 세션 쿠키:', document.cookie);
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    this.captchaImageUrl = URL.createObjectURL(blob);
    this.loginform.captcha = '';
  })
  .catch(error => {
    console.error('캡차 이미지 로드 실패:', error);
  });
}

,playAudioCaptcha() {
  if (this.isAudioLoading) return;
  
  this.isAudioLoading = true;
  this.captchaError = '';
  
  const apiUrl = process.env.VUE_APP_API_URL || "https://13.209.15.189";
  
  // 이미지 캡차 요청을 수동으로 처리
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${apiUrl}/api/captcha/image?t=${new Date().getTime()}`, true);
  xhr.withCredentials = true;  // 중요: 크로스 도메인 쿠키 허용
  xhr.responseType = 'blob';
  
  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log('이미지 캡차 로드 성공');
      
      // 이미지 데이터 처리
      const blob = new Blob([xhr.response], { type: 'image/jpeg' });
      this.captchaImageUrl = URL.createObjectURL(blob);
      
      // 세션이 생성되었는지 확인
      console.log('쿠키 상태:', document.cookie);
      
      // 쿠키가 설정될 시간 확보 - 충분히 긴 지연
      setTimeout(() => {
        // 오디오 캡차 요청도 XHR로 직접 처리
        const audioXhr = new XMLHttpRequest();
        audioXhr.open('GET', `${apiUrl}/api/captcha1-audio/audio?t=${new Date().getTime()}`, true);
        audioXhr.withCredentials = true;  // 중요: 크로스 도메인 쿠키 허용
        audioXhr.responseType = 'blob';
        
        audioXhr.onload = () => {
          if (audioXhr.status === 200) {
            console.log('오디오 캡차 로드 성공');
            
            // 오디오 데이터 처리
            const audioBlob = new Blob([audioXhr.response], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 오디오 재생
            const audioElement = document.getElementById('captchaAudio');
            audioElement.src = audioUrl;
            audioElement.play().catch(e => {
              console.error('오디오 재생 실패:', e);
            });
          } else {
            console.error('오디오 캡차 요청 실패:', audioXhr.status);
            
            // 에러 응답을 텍스트로 읽기
            const reader = new FileReader();
            reader.onload = () => {
              this.captchaError = `음성 캡차 오류: ${reader.result}`;
            };
            reader.readAsText(audioXhr.response);
          }
          
          this.isAudioLoading = false;
        };
        
        audioXhr.onerror = () => {
          console.error('오디오 캡차 요청 네트워크 오류');
          this.captchaError = "네트워크 오류로 음성 캡차를 로드할 수 없습니다.";
          this.isAudioLoading = false;
        };
        
        // 오디오 요청 보내기
        audioXhr.send();
      }, 5000);  // 5초 지연 - 서버 세션 처리에 충분한 시간
    } else {
      console.error('이미지 캡차 로드 실패:', xhr.status);
      this.captchaError = "캡차 이미지를 로드할 수 없습니다.";
      this.isAudioLoading = false;
    }
  };
  
  xhr.onerror = () => {
    console.error('이미지 캡차 요청 실패');
    this.captchaError = "네트워크 오류로 캡차 이미지를 로드할 수 없습니다.";
    this.isAudioLoading = false;
  };
  
  // 이미지 요청 보내기
  xhr.send();
},
  // IP 보안 토글
  toggleIpSecurity() {
    this.ipSecurity = !this.ipSecurity;
  },
  async handleSubmit() {
  try {
    // 로그 추가 - 요청 시작 정보
    const apiUrl = process.env.VUE_APP_API_URL || "https://13.209.15.189";
    console.log('로그인 요청 시작:', {
      url: `${apiUrl} `,
      data: {
        username: this.loginform.username,
        password: '******', // 비밀번호는 보안상 마스킹
        rememberMe: this.loginform.rememberMe,
        captcha: this.showCaptcha ? this.loginform.captcha : undefined
      }
    });

    // 유효성 검사 먼저 실행
    const isUsernameValid = this.validateUsername();
    const isPasswordValid = this.validatePassword();
    const isCaptchaValid = !this.showCaptcha || this.validateCaptcha();

    // 로그 추가 - 유효성 검증 결과
    console.log('유효성 검증 결과:', {
      username: isUsernameValid,
      password: isPasswordValid,
      captcha: isCaptchaValid
    });

    // 하나라도 유효하지 않으면 제출 중단
    if (!isUsernameValid || !isPasswordValid || !isCaptchaValid) {
      console.log('유효성 검증 실패로 로그인 요청 중단');
      return;
    }

    this.isLoading = true;
    this.errormessage = '';
    this.successMessage = '';
    this.captchaError = '';

    const logindata = {
        username: this.loginform.username,
        password: this.loginform.password,
        rememberMe: this.loginform.rememberMe // 로그인 유지 옵션 추가
    };
    
    // 캡차가 표시되어 있으면 캡차 값 추가
    if (this.showCaptcha) {
      logindata.captcha = this.loginform.captcha;
    }
    
    // 로그 추가 - 로그인 요청 설정
    console.log('로그인 요청 설정:', {
      method: 'POST',
      url: `${apiUrl}/api/auth/login`,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: { ...logindata, password: '******' } // 비밀번호 마스킹
    });
    
    const response = await axios.post(`${apiUrl}/api/auth/login`, logindata, {
        timeout: 10000,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    
    // 로그 추가 - 로그인 응답
    console.log('로그인 응답 수신:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data ? {
        userId: response.data.userId,
        username: response.data.username,
        hasToken: !!response.data.token,
        tokenLength: response.data.token ? response.data.token.length : 0
      } : null
    });

    if (response.data && response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        this.successMessage = "로그인 성공!";
        console.log('토큰 저장됨:', response.data.token.substring(0, 10) + '...'); // 토큰 일부만 표시
        console.log('localStorage 확인:', localStorage.getItem('userToken').substring(0, 10) + '...'); // 토큰 일부만 표시
        
        const userData = {
            userId: response.data.userId,
            username: response.data.username,
            loginType: 'normal' // 일반 로그인 타입 추가
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('사용자 데이터 저장됨:', userData);
        
        // 로그인 성공 시 캡차 초기화 및 실패 횟수 리셋
        this.showCaptcha = false;
        this.loginFailCount = 0;
        this.loginform.captcha = '';
        sessionStorage.removeItem('loginFailCount'); // 세션 스토리지에서도 삭제

        // 바로 대시보드로 리다이렉트
        console.log('대시보드로 즉시 리다이렉트 실행');
        this.$router.push('/dashboard');
    } else {
        console.log('로그인 응답에 토큰이 없음:', response.data);
        this.errormessage = '로그인은 성공했으나 토큰이 없습니다.';
    }
  } catch (error) {
    console.error('로그인 실패', error);
    
    // 상세 오류 정보 로깅
    console.log('로그인 오류 상세 정보:', {
      message: error.message,
      name: error.name,
      stack: error.stack ? error.stack.split('\n')[0] : null,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        timeout: error.config.timeout,
      } : null,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
      request: error.request ? {
        responseURL: error.request.responseURL,
        status: error.request.status,
        statusText: error.request.statusText,
        responseType: error.request.responseType,
      } : 'No request object'
    });
    
    // 로그인 실패 시 아이디와 비밀번호 필드 초기화
    this.loginform.username = '';
    this.loginform.password = '';
    
    // 로그인 실패 횟수 증가
    this.loginFailCount++;
    console.log('로그인 실패 횟수 증가:', this.loginFailCount);
    
    // 세션 스토리지에 로그인 실패 횟수 저장
    sessionStorage.setItem('loginFailCount', this.loginFailCount.toString());
    
    // 3번 이상 실패하면 캡차 표시
    if (this.loginFailCount >= 3) {
      console.log('로그인 3회 이상 실패로 캡차 표시');
      this.showCaptcha = true;
      this.refreshCaptcha();
    }

    if (error.response) {
      // 서버가 응답을 반환했지만 2xx 범위를 벗어나는 상태 코드
      console.log('에러 응답:', error.response.data);
      console.log('에러 상태:', error.response.status);
      
      // 캡차 오류인 경우 특별 메시지 표시
      if (error.response.data && error.response.data.message && error.response.data.message.includes('캡차')) {
        console.log('캡차 검증 실패 오류 감지');
        this.captchaError = error.response.data.message;
        this.refreshCaptcha();
      } else {
        this.errormessage = `오류 발생 (${error.response.status}): ${error.response.data.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'}`;
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.log('요청은 되었으나 응답 없음:', error.request);
      this.errormessage = '서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.';
    } else {
      // 요청 설정 중 에러 발생
      console.log('요청 설정 중 오류:', error.message);
      this.errormessage = '요청 설정 중 오류가 발생했습니다.';
    }

  } finally {
    console.log('로그인 요청 완료 (성공/실패 여부 관계없이)');
    this.isLoading = false;
  }
},
  vaildForm() {
    // 기본 유효성 검사
    let isValid = !!this.loginform.username && !!this.loginform.password;
    
    // 캡차가 표시되면 캡차 입력값도 검사
    if (this.showCaptcha) {
      isValid = isValid && !!this.loginform.captcha;
    }
    
    this.isFormVaild = isValid;
    
    if (this.isFormVaild) {
      this.errormessage = '';
      this.usernameError = '';
      this.passwordError = '';
      this.captchaError = '';
    }
  },
  kakaoLogin() {
    this.isLoading = true;
    this.errormessage = '';
    this.successMessage = '';
    
    // API URL 설정
    const apiUrl = process.env.VUE_APP_API_URL || "https://13.209.15.189";
    
    // 2. remember_me 파라미터 제거
    const url = `${apiUrl}/api/auth/kakao/login`;
    
    console.log('카카오 로그인 리다이렉트:', url);
    
    // 카카오 로그인 API로 리다이렉트
    window.location.href = url;
  }
}
}
</script>

<style scoped>
header h1 {
color: #3a4374;
font-size: 1.8em;
margin-bottom: 1.5em;
text-align: center;
}

form {
max-width: 400px;
margin: 2rem auto;
padding: 2rem;
background-color: #ffffff;
border-radius: 8px;
text-align: center;
margin: 0 auto;
box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 상단 오류 메시지 스타일 */
.top-error-message {
background-color: #fff9f9;
color: #1f1f1f;
padding: 12px;
border-radius: 4px;
margin-bottom: 20px;
text-align: center;
font-size: 0.9rem;
line-height: 1.5;
max-width: 400px;
margin-left: auto;
margin-right: auto;
}

/* 입력 컨테이너 스타일 */
.input-container {
margin-bottom: 1.5rem;
background-color: #f5f6f7;
border-radius: 4px;
overflow: hidden;
}

/* 구분선 스타일 */
.divider {
height: 1px;
background-color: #ddd;
width: 100%;
}

/* 입력 필드 그룹 컨테이너 스타일 */
.input-group {
position: relative;
height: 50px; /* 고정 높이 설정 */
border: 1px solid #ddd;
}

/* 첫 번째 입력 그룹의 상단과 두 번째 입력 그룹의 하단만 border-radius 적용 */
.input-group:first-child {
border-radius: 4px 4px 0 0;
}

.input-group:last-child {
border-radius: 0 0 4px 4px;
}

/* 포커스 상태의 입력 그룹 스타일 */
.input-group:focus-within {
background-color: #fff; /* 포커스 시 배경색 변경 */
border-color: #03c75a; /* 포커스 시 테두리 색상 변경 */
z-index: 1; /* 포커스된 요소를 앞으로 가져와 테두리가 보이도록 */
}

/* 입력 필드 스타일 */
input {
width: 100%;
height: 100%;
padding: 0.8rem 1rem 0; /* 위쪽 패딩 추가 */
border: none; /* 기존 테두리 제거 */
outline: none; /* 포커스 아웃라인 제거 */
background: transparent;
font-size: 1rem;
box-sizing: border-box;
}

/* 라벨 스타일 - 네이버 스타일 적용 */
label {
position: absolute;
left: 1rem;
top: 50%;
transform: translateY(-50%); /* 세로 중앙 정렬 */
color: #999;
font-size: 1rem;
transition: all 0.2s ease;
pointer-events: none; /* 라벨을 통한 클릭 방지 */
}

/* 포커스 상태의 라벨 */
label.focused {
top: 10px;
font-size: 0.75rem;
color: #999;
transform: translateY(0);
}

/* 값이 있는 상태의 라벨 */
label.has-value {
top: 10px;
font-size: 0.75rem;
transform: translateY(0);
}

/* 로그인 유지 및 IP 보안 스타일 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
  text-align: left;
}

.remember-login {
  display: flex;
  align-items: center;
}

.remember-login input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.checkbox-label {
  position: static;
  transform: none;
  pointer-events: auto;
}

.ip-security {
  display: flex;
  align-items: center;
}

.toggle-switch {
  display: inline-block;
  margin-left: 5px;
  background-color: #ccc;
  color: #fff;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.8rem;
  cursor: pointer;
}

.toggle-switch.on {
  background-color: #03c75a;
}

button {
width:100%;
padding: 0.8rem;
background-color: #b5b5b7;
color: white;
border: none;
border-radius: 4px;
font-size:1rem;
font-weight: 600;
transition: background-color 0.3s ease;
cursor: pointer;
margin-top: 1rem;
}

.error-message {
color: #e03131;
margin-top: 1rem;
font-size: 0.9rem;
text-align: center;
}

.success-message {
color: #2b8a3e;
margin-top: 1rem;
font-size: 0.9rem;
text-align: center;
}

button.active {
background-color: #03c75a; /* 활성 상태: 원래 색상 */
}

button:hover.active {
background-color: #009f47; /* 호버 + 활성 상태 */
}

/* 캡차 관련 스타일 */
.captcha-wrapper {
margin-bottom: 1.5rem;
border: 1px solid #ddd;
border-radius: 4px;
overflow: hidden;
}

.captcha-content {
padding: 15px;
background-color: #fff;
}

.captcha-image-container {
width: 100%;
}

.captcha-image {
width: 100%;
height: auto;
border-radius: 4px;
}

.captcha-input-container {
padding: 10px 15px;
background-color: #fff;
}

.captcha-input-group {
display: flex;
align-items: center;
gap: 10px;
}

.captcha-input {
flex: 1;
padding: 10px;
border: 1px solid #ddd;
border-radius: 4px;
font-size: 1rem;
box-sizing: border-box;
height: auto;
}

.captcha-buttons {
display: flex;
gap: 5px;
}

.captcha-button {
width: 40px;
height: 40px;
border: 1px solid #ddd;
border-radius: 4px;
background-color: #f5f6f7;
display: flex;
align-items: center;
justify-content: center;
margin: 0;
padding: 0;
cursor: pointer;
}

.captcha-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
color: #666;
font-size: 18px;
}

.captcha-info {
padding: 8px 15px;
background-color: #f5f6f7;
color: #03c75a;
text-align: center;
font-size: 0.8rem;
}

/* 소셜 로그인 관련 스타일 */
.social-login-section {
margin-top: 2rem;
}

.divider-with-text {
display: flex;
align-items: center;
margin: 1.5rem 0;
}

.divider-with-text::before,
.divider-with-text::after {
content: "";
flex: 1;
border-bottom: 1px solid #ddd;
}

.divider-with-text span {
padding: 0 10px;
color: #999;
font-size: 0.9rem;
}

.social-login-buttons {
display: flex;
flex-direction: column;
gap: 10px;
}

.kakao-login-btn {
background-color: transparent;
padding: 0;
border: none;
cursor: pointer;
margin: 0 auto;
width: 100%;
}

.kakao-login-btn img {
width: 100%;
height: auto;
}

@media (max-width: 480px) {
form {
  max-width: 200px;
  padding: 1.5rem;
}

.captcha-input-group {
  flex-direction: column;
}

.captcha-buttons {
  width: 100%;
  justify-content: flex-end;
}

.kakao-login-btn img {
  width: 100%;
}

.login-options {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
}

@media (min-width: 480px) and (max-width: 1000px) {
form {
  max-width: 300px;
  padding: 1.5rem;
}

.kakao-login-btn img {
  width: 100%;
}
}
</style>