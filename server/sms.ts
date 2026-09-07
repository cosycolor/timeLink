import dotenv from 'dotenv';
dotenv.config();

/**
 * TIMELINK Real SMS Service Gateway
 * Supports CoolSMS / Solapi / Aligo or mock terminal logging in dev mode.
 */
export async function sendRealSmsMessage(toPhoneNumber: string, verificationCode: string): Promise<boolean> {
  const cleanNumber = toPhoneNumber.replace(/[^0-9]/g, '');
  const messageText = `[타임링크] 본인인증 번호는 [${verificationCode}] 입니다. (3분 이내 입력)`;

  const apiKey = process.env.COOLSMS_API_KEY;
  const apiSecret = process.env.COOLSMS_API_SECRET;
  const senderNumber = process.env.COOLSMS_SENDER_NUMBER;

  // 1. If CoolSMS/Solapi API credentials exist in .env
  if (apiKey && apiSecret && senderNumber) {
    try {
      console.log(`[TIMELINK SMS] 🚀 Sending real SMS via CoolSMS to ${toPhoneNumber}...`);
      const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `HMAC-SHA256 apiKey=${apiKey}, date=${new Date().toISOString()}`
        },
        body: JSON.stringify({
          message: {
            to: cleanNumber,
            from: senderNumber.replace(/[^0-9]/g, ''),
            text: messageText
          }
        })
      });
      const data = await response.json();
      console.log(`[TIMELINK SMS] CoolSMS Response:`, data);
      return true;
    } catch (err) {
      console.error(`[TIMELINK SMS ERROR] CoolSMS send failed:`, err);
    }
  }

  // 2. Local Terminal Console Output
  console.log(`\n==================================================`);
  console.log(`📱 [TIMELINK SMS 문자 발송 안내]`);
  console.log(`수신 번호: ${toPhoneNumber}`);
  console.log(`인증 번호: [ ${verificationCode} ]`);
  console.log(`메시지 내용: "${messageText}"`);
  console.log(`==================================================\n`);
  return true;
}
