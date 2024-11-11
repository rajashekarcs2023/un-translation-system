# app.py
import gradio as gr
import pandas as pd
from datetime import datetime
from pathlib import Path

class FeedbackCollector:
    def __init__(self):
        # Create data folder if it doesn't exist
        self.data_dir = Path("feedback_data")
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize or load feedback file
        self.feedback_file = self.data_dir / "feedback.csv"
        if not self.feedback_file.exists():
            # Create empty CSV with headers
            pd.DataFrame(columns=[
                'timestamp', 
                'input', 
                'model_output', 
                'corrected'
            ]).to_csv(self.feedback_file, index=False)

    def add_feedback(self, input_text, model_output, corrected_output):
        """Save a new piece of feedback"""
        # Validate inputs
        if not input_text or not model_output or not corrected_output:
            return "Error: All fields are required!"
        if len(input_text) < 2:
            return "Error: Input text too short!"

        # Create new feedback entry
        new_feedback = pd.DataFrame([{
            'timestamp': datetime.now().isoformat(),
            'input': input_text,
            'model_output': model_output,
            'corrected': corrected_output
        }])
        
        # Append to CSV without rewriting the header
        new_feedback.to_csv(
            self.feedback_file, 
            mode='a', 
            header=False, 
            index=False
        )
        
        # Get total count
        df = pd.read_csv(self.feedback_file)
        return f"Feedback saved! Total samples: {len(df)}"

    def get_recent_feedback(self, n=5):
        """Get last n feedback entries"""
        df = pd.read_csv(self.feedback_file)
        # Convert last n rows to dictionary format for display
        recent_entries = df.tail(n).to_dict('records')
        return recent_entries

    def get_statistics(self):
        """Get basic statistics about the feedback data"""
        df = pd.read_csv(self.feedback_file)
        return {
            "total_samples": len(df),
            "unique_inputs": df['input'].nunique(),
            "last_update": df['timestamp'].max()
        }

    def export_data(self, format='excel'):
        """Export feedback data to different formats"""
        df = pd.read_csv(self.feedback_file)
        if format == 'excel':
            df.to_excel('feedback_export.xlsx', index=False)
        elif format == 'json':
            df.to_json('feedback_export.json', orient='records')
        return "Data exported successfully!"

# Create the feedback collector
collector = FeedbackCollector()

# Create simple UI
with gr.Blocks() as demo:
    gr.Markdown("# ML Model Feedback Collector")
    
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            model_output = gr.Textbox(label="Model Output")
            corrected = gr.Textbox(label="Corrected Output")
            submit_btn = gr.Button("Submit Feedback")
            
            # Add export buttons
            with gr.Row():
                export_excel_btn = gr.Button("Export to Excel")
                export_json_btn = gr.Button("Export to JSON")
        
        with gr.Column():
            status = gr.Textbox(label="Status")
            stats = gr.JSON(label="Statistics", value={})
            recent = gr.JSON(label="Recent Feedback", value=[])
    
    # Submit feedback
    submit_btn.click(
        fn=collector.add_feedback,
        inputs=[input_text, model_output, corrected],
        outputs=status
    ).then(
        fn=collector.get_recent_feedback,
        outputs=recent
    ).then(
        fn=collector.get_statistics,
        outputs=stats
    )
    
    # Export buttons
    export_excel_btn.click(
        fn=lambda: collector.export_data('excel'),
        outputs=status
    )
    
    export_json_btn.click(
        fn=lambda: collector.export_data('json'),
        outputs=status
    )

if __name__ == "__main__":
    demo.launch(share=True)