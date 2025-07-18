import pandas as pd
import numpy as np
import pickle
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score

class AutoLinearRegression:
    def __init__(self):
        self.model = None
        self.encoders = {}
        self.feature_columns = []

    def fit(self, X, y):
        try:
            X = pd.DataFrame(X)
            y = pd.Series(y)

            cat_cols = [col for col in X.columns if X[col].dtype == object or isinstance(X[col].iloc[0], str)]
            num_cols = [col for col in X.columns if col not in cat_cols]

            for col in cat_cols:
                vals = X[col].dropna().unique()
                if len(vals) <= 10:
                    enc = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
                    transformed = enc.fit_transform(X[[col]])
                    enc.feature_names = [f"{col}_{c}" for c in enc.categories_[0]]
                    self.encoders[col] = enc
                    for i, fname in enumerate(enc.feature_names):
                        X[fname] = transformed[:, i]
                    X.drop(columns=[col], inplace=True)
                else:
                    le = LabelEncoder()
                    X[col] = le.fit_transform(X[col].astype(str))
                    self.encoders[col] = le

            for col in num_cols:
                X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)

            self.feature_columns = X.columns.tolist()

            self.model = LinearRegression()
            self.model.fit(X, y)

            y_pred = self.model.predict(X)
            mse = mean_squared_error(y, y_pred)

            r2 = r2_score(y, y_pred)

            return {
                'success': True,
                'mse': mse,
                'r2_score': r2,
                'coef': self.model.coef_.tolist() if hasattr(self.model, 'coef_') else None,
                'intercept': self.model.intercept_ if hasattr(self.model, 'intercept_') else None,
                'used_features': self.feature_columns
            }

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def predict(self, X_new):
        X_new = pd.DataFrame(X_new)

        for col, enc in self.encoders.items():
            if isinstance(enc, OneHotEncoder):
                transformed = enc.transform(X_new[[col]])
                for i, fname in enumerate(enc.feature_names):
                    X_new[fname] = transformed[:, i]
                X_new.drop(columns=[col], inplace=True)
            else:
                if col in X_new.columns:
                    X_new[col] = X_new[col].astype(str).map(lambda x: enc.transform([x])[0] if x in enc.classes_ else -1)
                else:
                    X_new[col] = -1

        for col in X_new.columns:
            if col not in self.encoders:
                X_new[col] = pd.to_numeric(X_new[col], errors='coerce').fillna(0)

        for col in self.feature_columns:
            if col not in X_new.columns:
                X_new[col] = 0

        X_new = X_new[self.feature_columns]

        return self.model.predict(X_new)

    def save(self, path):
        try:
            with open(path, 'wb') as f:
                pickle.dump(self, f)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @staticmethod
    def load(path):
        with open(path, 'rb') as f:
            return pickle.load(f)
