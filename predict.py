from models.logistic_regression import AutoLogisticRegression
import pandas as pd

automl = AutoLogisticRegression.load("C:\\Users\\Eren\\Desktop\\model_deneme\\model3.pkl")

# Tahmin verisi
row = {
    "weather": "gunesli",
    "drink_item": "ayran",
    "temperature": 0,
    "time_of_day": "ogle yemegi"
}

df = pd.DataFrame([row])

# Tahmin yap
prediction = automl.predict(df)
print("Tahmin:", prediction[0])
