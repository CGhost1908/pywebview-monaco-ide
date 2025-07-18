from sklearn.cluster import KMeans
import pickle
import os

model = None

def train_kmeans(X, n_clusters=3):
    global model
    try:
        model = KMeans(n_clusters=n_clusters)
        model.fit(X)

        return {
            'success': True,
            'cluster_centers': model.cluster_centers_.tolist(),
            'labels': model.labels_.tolist()
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def save_kmeans_model(folder_path):
    global model
    if model is None:
        return {'success': False, 'error': 'Model has not been trained yet.'}
    try:
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        save_path = os.path.join(folder_path, "kmeans_model.pkl")
        with open(save_path, 'wb') as f:
            pickle.dump(model, f)
        return {'success': True, 'message': f'Model saved at {save_path}'}
    except Exception as e:
        return {'success': False, 'error': str(e)}
