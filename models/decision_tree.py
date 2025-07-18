from sklearn.tree import DecisionTreeClassifier
import pickle
import os

model = None

def train_decision_tree(X, y):
    global model
    try:
        model = DecisionTreeClassifier()
        model.fit(X, y)
        accuracy = model.score(X, y)

        return {
            'success': True,
            'accuracy_score': accuracy,
            'tree_depth': model.get_depth(),
            'num_leaves': model.get_n_leaves()
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def save_decision_tree_model(folder_path):
    global model
    if model is None:
        return {'success': False, 'error': 'Model has not been trained yet.'}
    try:
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        save_path = os.path.join(folder_path, "decision_tree_model.pkl")
        with open(save_path, 'wb') as f:
            pickle.dump(model, f)
        return {'success': True, 'message': f'Model saved at {save_path}'}
    except Exception as e:
        return {'success': False, 'error': str(e)}
