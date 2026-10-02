import os
import sys
import telebot
from telebot import types

TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')

bot = telebot.TeleBot(TOKEN)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

IPA_PATH = os.path.join(BASE_DIR, 'college-app.ipa')
CONFIG_PATH = os.path.join(BASE_DIR, 'college-app.mobileconfig')
HTML_PATH = os.path.join(BASE_DIR, 'college-app-ios.html')
APK_PATH = os.path.join(BASE_DIR, 'college-app.apk')

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    markup = types.InlineKeyboardMarkup(row_width=1)
    btn_ios_profile = types.InlineKeyboardButton("Установить на iPhone (.mobileconfig)", callback_data="send_config")
    btn_ios_ipa = types.InlineKeyboardButton("Установить на iPhone (.ipa для Scarlet/TrollStore)", callback_data="send_ipa")
    btn_android = types.InlineKeyboardButton("Скачать для Android (.apk)", callback_data="send_apk")
    btn_html = types.InlineKeyboardButton("Офлайн веб-версия (.html)", callback_data="send_html")
    markup.add(btn_ios_profile, btn_ios_ipa, btn_android, btn_html)

    text = (
        "Marinesko App | Расписание колледжа\n\n"
        "Выберите платформу для загрузки приложения:"
    )
    bot.send_message(message.chat.id, text, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call):
    chat_id = call.message.chat.id
    if call.data == "send_config":
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, 'rb') as f:
                caption = (
                    "Marinesko App для iPhone:\n"
                    "1. Скачайте файл конфигурации.\n"
                    "2. Откройте Настройки iPhone -> Профиль загружен.\n"
                    "3. Нажмите Установить."
                )
                bot.send_document(chat_id, f, caption=caption)
        else:
            bot.send_message(chat_id, "Файл конфигурации не найден.")

    elif call.data == "send_ipa":
        if os.path.exists(IPA_PATH):
            with open(IPA_PATH, 'rb') as f:
                caption = "Marinesko App (.ipa) для установки через Scarlet, TrollStore или AltStore."
                bot.send_document(chat_id, f, caption=caption)
        else:
            bot.send_message(chat_id, "Файл .ipa не найден.")

    elif call.data == "send_apk":
        if os.path.exists(APK_PATH):
            with open(APK_PATH, 'rb') as f:
                caption = "Marinesko App для Android (.apk). Скачайте и установите."
                bot.send_document(chat_id, f, caption=caption)
        else:
            bot.send_message(chat_id, "Файл .apk не найден.")

    elif call.data == "send_html":
        if os.path.exists(HTML_PATH):
            with open(HTML_PATH, 'rb') as f:
                caption = "Маринеско Апп (автономная офлайн-версия для браузера)."
                bot.send_document(chat_id, f, caption=caption)
        else:
            bot.send_message(chat_id, "Файл .html не найден.")

if __name__ == '__main__':
    if TOKEN == 'YOUR_BOT_TOKEN_HERE':
        print("Для запуска бота укажите BOT_TOKEN в файле или переменной окружения.")
    else:
        print("Бот запущен...")
        bot.infinity_polling()
