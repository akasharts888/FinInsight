from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
nltk.download('vader_lexicon')

sia = SentimentIntensityAnalyzer()
headline = "Company ABC's profits soar, beating all expectations!"
sentiment_score = sia.polarity_scores(headline)['compound']
print(f"'{headline}' -> Score: {sentiment_score}") 
