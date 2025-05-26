# app/model.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

class SentimentAnalyzer:
    def __init__(self):
        self.model_name = "nlptown/bert-base-multilingual-uncased-sentiment"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)

    def predict(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = F.softmax(outputs.logits, dim=1)
            predicted_class = torch.argmax(probs, dim=1).item()
            sentiment = self.map_sentiment(predicted_class)
            return {
                "label": sentiment,
                "probabilities": probs.tolist()[0]
            }

    def map_sentiment(self, class_id):
        mapping = {
            0: "très négatif",
            1: "négatif",
            2: "neutre",
            3: "positif",
            4: "très positif"
        }
        return mapping.get(class_id, "inconnu")
