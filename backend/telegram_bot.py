import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get the token from environment variable
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

# Define a few command handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    await update.message.reply_text(
        'Hi! I am the Feedback Analysis Bot. Send me your feedback, and I will analyze the sentiment using machine learning.'
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    await update.message.reply_text(
        'Just send me any text message as feedback, and I will analyze its sentiment using a machine learning model.'
    )

async def analyze_feedback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Analyze the sentiment of the user's message."""
    feedback = update.message.text
    
    # Send the feedback to the backend for analysis
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/analyze",
            json={"comment": feedback, "department": "Telegram"}
        )
        
        if response.status_code == 200:
            result = response.json()
            sentiment = result['sentiment']
            score = result['score']
            
            # Reply with the sentiment analysis result
            await update.message.reply_text(
                f"Thank you for your feedback!\n\n"
                f"Sentiment: {sentiment.capitalize()}\n"
                f"Score: {score:.2f}"
            )
        else:
            await update.message.reply_text(
                "Sorry, I couldn't analyze your feedback. Please try again later."
            )
    except Exception as e:
        logger.error(f"Error analyzing feedback: {e}")
        await update.message.reply_text(
            "Sorry, there was an error processing your feedback. Please try again later."
        )

def main() -> None:
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, analyze_feedback))

    # Run the bot until the user presses Ctrl-C
    application.run_polling()

if __name__ == '__main__':
    main()