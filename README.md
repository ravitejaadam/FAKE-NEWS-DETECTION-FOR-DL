# Fake News Detection using Deep Learning

An AI-powered web application that uses a TextCNN (Convolutional Neural Network) model to classify news articles as REAL or FAKE with confidence scoring.

## Features

- **Real-time Classification**: Paste any news article and get instant results
- **Confidence Scoring**: See how confident the model is in its prediction
- **Interactive Samples**: Test with pre-loaded real and fake news examples
- **Modern UI**: Clean, responsive interface with glassmorphism design
- **Fast Processing**: Lightweight model for quick predictions

## Technologies Used

- **Backend**: Python Flask
- **AI Model**: TensorFlow/Keras TextCNN
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with animations and responsive design

## Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd fake-news-detection
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure model files are present:
   - `textcnn_model.keras` (the trained model)
   - `tokenizer.pkl` (text tokenizer)

## Usage

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open your browser and navigate to `http://localhost:5000`

3. Paste a news article in the textarea or click "Load Real News Sample" or "Load Fake News Sample"

4. Click the analyze button to get the prediction

## API Endpoint

The application exposes a REST API endpoint:

- **POST** `/predict`
  - Body: `{"text": "your news article here"}`
  - Response: `{"prediction": "REAL" or "FAKE", "confidence": 95.67}`

## Model Details

- **Architecture**: TextCNN with convolutional layers for text classification
- **Training Data**: Balanced dataset of real and fake news articles
- **Input**: Raw text (up to 6000 characters)
- **Output**: Binary classification with confidence score

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please check the license file for details.

## Disclaimer

This tool is for educational and research purposes. AI predictions are not 100% accurate and should not be used as the sole basis for decision-making.