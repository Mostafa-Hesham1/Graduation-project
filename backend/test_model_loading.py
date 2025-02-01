from fastai.vision.all import load_learner
from pathlib import WindowsPath

model_path = r"C:\models\resnet152_best_model.pkl"
try:
    learn = load_learner(model_path)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")