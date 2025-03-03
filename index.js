const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// CORS को एनेबल करें
app.use(cors());

// YouTube वीडियो डाउनलोड एंडपॉइंट
app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    // URL वैलिडेशन
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        // वीडियो इन्फो प्राप्त करें (User-Agent और Headers के साथ)
        const info = await ytdl.getInfo(videoURL, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.youtube.com/',
                    'Origin': 'https://www.youtube.com',
                    'Cookie': 'GPS=1; PREF=tz=Asia.Calcutta; SID=g.a000uQiI3uWEGmEGSyxtv6aA4E6uke_vdMXd8kio7pmGDait9gMgS7d1d_7Y-KerjU-f-KZZ_wACgYKAcsSARASFQHGX2MiLqNL1KCLLP82ZU6p93t5DhoVAUF8yKqXR6zmASpYYtLT6gr3K0F10076; __Secure-1PSIDTS=sidts-CjIBEJ3XV2LeV8rDr0dIhc98oCnq3A_zNrqC5honByixZ3_4KvKTNtBBnz0g7gJgPb7SVxAA; __Secure-3PSIDTS=sidts-CjIBEJ3XV2LeV8rDr0dIhc98oCnq3A_zNrqC5honByixZ3_4KvKTNtBBnz0g7gJgPb7SVxAA; __Secure-1PSID=g.a000uQiI3uWEGmEGSyxtv6aA4E6uke_vdMXd8kio7pmGDait9gMgmkzmJt12QwpAGege5B94hQACgYKAfkSARASFQHGX2Mi99UwRav7kJcrbybxUFo19xoVAUF8yKpm6FeZbu8hY9_bdSxfqJhH0076; __Secure-3PSID=g.a000uQiI3uWEGmEGSyxtv6aA4E6uke_vdMXd8kio7pmGDait9gMgLTFRke0hwS2r7nNP0NdJfAACgYKAS8SARASFQHGX2Mi0uFpjj9rk4YaJBtIEmzTRhoVAUF8yKpfFPomgBblowfG0DpCMzMX0076; HSID=AUjP60f9-Fygd1hQ2; SSID=AzxiT5X-Skl_mF2SZ; APISID=HKWniMc9mx6HOk7c/AuvY1vY4htUF7gC-Q; SAPISID=J36EoE-qllypMGQ3/AGuTVeOUkLdRsuey9; __Secure-1PAPISID=J36EoE-qllypMGQ3/AGuTVeOUkLdRsuey9; __Secure-3PAPISID=J36EoE-qllypMGQ3/AGuTVeOUkLdRsuey9; LOGIN_INFO=AFmmF2swRgIhAPV9IlV1X76Inlpj0mgKR5OcjCurDRVB6E1rATwoQF2NAiEAov4NKdzwk0BxfpnYk5oyOxxuykVR2AHCBtD6FLeNY_Q:QUQ3MjNmeXV6STlSdVAtSmdKN1NmekhWQmNpaUNycHhyeXhGUEFGaUFYc0IxVTM1Y2NuUEl3bF85NjJycTloTFVUNERfV1lUZjRRRkJtN2xlN1hMVjVmUm01cGZwVGJ2YkFFbURBSkdNWndiSDZLMXI3WVdCMW1VZ0xaSWN6TV9fWHdsWGRiLWJwNmVySEhzaXBsZHVIbVVNT3lyZGJrVzNn; SIDCC=AKEyXzVV3q6MzmCA5cmoUWn_C0CFhhhPVnuU5TQs12AAVFLF36pkRB4rfc272JRE2H5txTJjLg; __Secure-1PSIDCC=AKEyXzXgV-rJhB9XbpjpUQwpsbv62PAezQygo7-k3JgH7zydCH1iq_Eq_62z8zledUUUe8zo; __Secure-3PSIDCC=AKEyXzX6LBRiYNiRZdTDZiglZgVSpBhefTI0XFJd7vvbTstq-gTEMtw9ZmSgL_wLb9Ke0S50'
                }
            }
        });

        // वीडियो डाउनलोड करें
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
        ytdl(videoURL, {
            format: format,
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.youtube.com/',
                    'Origin': 'https://www.youtube.com',
                    'Cookie': 'GPS=1; PREF=tz=Asia.Calcutta; SID=g.a000uQiI3uWEGmEGSyxtv6aA4E6uke_vdMXd8kio7pmGDait9gMgS7d1d_7Y-KerjU-f-KZZ_wACgYKAcsSARASFQHGX2MiLqNL1KCLLP82ZU6p93t5DhoVAUF8yKqXR6zmASpYYtLT6gr3K0F10076; __Secure-1PSIDTS=sidts-CjIBEJ3XV2LeV8rDr0dIhc98oCnq3A_zNrqC5honByixZ3_4KvKTNtBBnz0g7gJgPb7SVxAA; __Secure-3PSIDTS=sidts-CjIBEJ3XV2LeV8rDr0dIhc98oCnq3A_zNrqC5honByixZ3_4KvKTNtBBnz0g7gJgPb7SVxAA; __Secure-1PSID=g.a000uQiI3uWEGmEGSyxtv6aA4E6uke_vdMXd8kio7pmGDait9gMgmkzmJt12QwpAGege5B94hQACgYKAfkSARASFQHGX2Mi99UwRav7kJcrbybxUFo19xoVAUF8yKpm6FeZbu8hY9_bdSxfqJhH0076; __Secure-3PSID=g.a000uQiI3uWEGmEGSyxtv6aA4E6uke_vdMXd8kio7pmGDait9gMgLTFRke0hwS2r7nNP0NdJfAACgYKAS8SARASFQHGX2Mi0uFpjj9rk4YaJBtIEmzTRhoVAUF8yKpfFPomgBblowfG0DpCMzMX0076; HSID=AUjP60f9-Fygd1hQ2; SSID=AzxiT5X-Skl_mF2SZ; APISID=HKWniMc9mx6HOk7c/AuvY1vY4htUF7gC-Q; SAPISID=J36EoE-qllypMGQ3/AGuTVeOUkLdRsuey9; __Secure-1PAPISID=J36EoE-qllypMGQ3/AGuTVeOUkLdRsuey9; __Secure-3PAPISID=J36EoE-qllypMGQ3/AGuTVeOUkLdRsuey9; LOGIN_INFO=AFmmF2swRgIhAPV9IlV1X76Inlpj0mgKR5OcjCurDRVB6E1rATwoQF2NAiEAov4NKdzwk0BxfpnYk5oyOxxuykVR2AHCBtD6FLeNY_Q:QUQ3MjNmeXV6STlSdVAtSmdKN1NmekhWQmNpaUNycHhyeXhGUEFGaUFYc0IxVTM1Y2NuUEl3bF85NjJycTloTFVUNERfV1lUZjRRRkJtN2xlN1hMVjVmUm01cGZwVGJ2YkFFbURBSkdNWndiSDZLMXI3WVdCMW1VZ0xaSWN6TV9fWHdsWGRiLWJwNmVySEhzaXBsZHVIbVVNT3lyZGJrVzNn; SIDCC=AKEyXzVV3q6MzmCA5cmoUWn_C0CFhhhPVnuU5TQs12AAVFLF36pkRB4rfc272JRE2H5txTJjLg; __Secure-1PSIDCC=AKEyXzXgV-rJhB9XbpjpUQwpsbv62PAezQygo7-k3JgH7zydCH1iq_Eq_62z8zledUUUe8zo; __Secure-3PSIDCC=AKEyXzX6LBRiYNiRZdTDZiglZgVSpBhefTI0XFJd7vvbTstq-gTEMtw9ZmSgL_wLb9Ke0S50'
                }
            }
        }).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error downloading video' });
    }
});

// सर्वर शुरू करें
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
