# Translate4Good: UNCCD AI Translation System

Translate4Good is an advanced AI-powered translation tool designed to meet the United Nations Convention to Combat Desertification (UNCCD)’s unique requirements. The system leverages FastAPI for a robust backend, handling the processing and coordination of language translation workflows, and React for an intuitive, user-friendly frontend interface. Translate4Good supports accurate, context-sensitive translation across six UN languages, aiming to streamline the translation process for technical UNCCD documents.

## Project Structure

The project is divided into three primary sections:

1. **Frontend**: Built with React, the frontend offers a clean and responsive interface for document submission, translation monitoring, and access to translation results.
2. **Backend**: Built with FastAPI, the backend manages agent workflows, processes translation requests, and provides endpoints for frontend interactions.
3. **AI Agents**: Autonomous modules within the backend, each dedicated to a specific task within the translation workflow to ensure high-quality, standardized output.

---
# un-translation-system
<img width="456" alt="Screenshot 2024-11-10 at 3 24 39 PM" src="https://github.com/user-attachments/assets/35fc8618-fb1c-4200-92c5-f0f27ab673be">

![image](https://github.com/user-attachments/assets/cb0e6b9a-d8d6-4843-bf44-02c1e29380b1)

## Backend (FastAPI)

### Overview

The backend is built using FastAPI, a modern Python web framework known for high performance and ease of use. It handles routing, agent orchestration, document processing, and provides the necessary API endpoints for frontend communication. The backend integrates a pipeline of four distinct agents, each tasked with a specific role in the translation process.

### Key Components

1. **API Endpoints**: The backend provides multiple endpoints for interacting with the agents, managing document uploads, and retrieving translation progress and results.
   
   - `POST /api/translate`: Accepts a document for translation, triggers the pipeline, and returns the translation once all agents have processed the document.
   - `GET /api/status/{document_id}`: Retrieves the current status of a document in the translation pipeline.
   - `GET /api/translated_document/{document_id}`: Provides the final translation and validation report.

2. **Agent Workflow**: The backend coordinates the document processing workflow among four AI agents (Document Classifier, Terminology Extractor, Translation Agent, and Quality Validator) that handle the translation in sequence.

3. **Data Models**: Pydantic models are used to define request and response schemas, ensuring structured data processing and validation across API endpoints.

### Running the Backend

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the FastAPI Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Access API Documentation**:
   FastAPI automatically generates interactive API documentation accessible at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Key Backend Features

- **Asynchronous Processing**: FastAPI’s async capabilities enable efficient handling of multiple requests, ensuring smooth user interactions even with large document sizes.
- **Modular Agent Design**: Each agent can be individually enhanced or modified, allowing for flexible updates and maintenance.
- **GPU Support for Model Inference**: Leverages PyTorch to utilize GPU (if available) for faster translation processing and model inference.
- **Custom Formatting**: Applies a post-processing layer to match document formatting, capitalization, and punctuation, ensuring translations maintain professional presentation standards.

---

## Frontend (React)

### Overview

The React-based frontend provides users with a streamlined, accessible interface for document submission, tracking translation status, and reviewing completed translations. The interface is designed for ease of use, allowing translators and other users to quickly submit documents and access translated outputs.

### Key Components

1. **Document Upload and Language Selection**: Users can upload documents and specify source and target languages, initiating the backend translation workflow.
2. **Translation Progress Tracker**: Displays real-time status updates, showing which agent is currently processing the document, enhancing transparency for the user.
3. **Translation Result Display**: Once the workflow is complete, users can view the translated document and download a validation report if needed.

### Running the Frontend

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm start
   ```

4. **Access the Frontend Interface**:
   Open your browser and go to `http://localhost:3000`.

### Key Frontend Features

- **Responsive Design**: Ensures usability across a range of devices, including desktops, tablets, and smartphones.
- **API Integration**: Communicates seamlessly with the FastAPI backend for data fetching and translation operations.
- **User Notifications**: Provides feedback and status updates as the document progresses through the translation pipeline.

---

## Getting Started

### Requirements

- Python 3.8+
- Node.js and npm
- GPU (optional for improved translation performance)

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/translate4good.git
   cd translate4good
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory and define necessary environment variables, such as API keys, if any.

3. **Install Dependencies**:
   - Backend dependencies: `pip install -r requirements.txt`
   - Frontend dependencies: `cd frontend && npm install`

4. **Start the Application**:
   - Start backend with `uvicorn app.main:app --reload`
   - Start frontend with `npm start` from the `frontend` directory

---

## Future Enhancements

- **Expanded Language Support**: Add more languages and improve existing language pair handling.
- **Custom Glossaries**: Allow users to upload custom glossaries to adapt terminology specific to other UN agencies.
- **Advanced Analytics**: Include analytics on translation accuracy, processing time, and terminology consistency.

---

## License

This project is licensed under the MIT License.

### Citations

Ziemski, M., Junczys-Dowmunt, M., and Pouliquen, B., (2016), The United Nations Parallel Corpus, Language Resources and Evaluation (LREC’16), Portorož, Slovenia, May 2016.

Translate4Good combines the power of FastAPI and React to create an efficient and accurate translation system tailored for the UNCCD's complex requirements. This tool not only provides high-quality translations but also helps streamline workflows for UN translators, ultimately enhancing their ability to manage vast amounts of content across multiple languages.
