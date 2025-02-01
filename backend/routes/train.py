from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

router = APIRouter()

class TrainRequest(BaseModel):
    dataset_path: str

@router.post("/")
def train_model(request: TrainRequest):
    try:
        df = pd.read_csv(request.dataset_path)
        X = df[['feature1', 'feature2']]  # Replace with actual feature columns
        y = df['target']  # Replace with actual target column
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = LinearRegression()
        model.fit(X_train, y_train)
        joblib.dump(model, 'model.joblib')
        return {"message": "Model trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
