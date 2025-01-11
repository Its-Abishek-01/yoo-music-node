<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Music</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 50px;
        }
        form {
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            max-width: 400px;
            background-color: #f9f9f9;
        }
        input[type="file"] {
            margin: 10px 0;
        }
        button {
            background-color: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 5px;
        }
        button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <h1>Upload Music</h1>
    <form id="uploadForm" enctype="multipart/form-data">
        <input type="file" name="file" id="fileInput" accept=".mp3" required />
        <button type="submit">Upload</button>
    </form>
    <div id="message"></div>

    <script>
        const uploadForm = document.getElementById('uploadForm');
        const fileInput = document.getElementById('fileInput');
        const messageDiv = document.getElementById('message');

        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const file = fileInput.files[0];
            if (!file) {
                messageDiv.textContent = "Please select a file!";
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    messageDiv.textContent = `File uploaded successfully: ${result.filename}`;
                    messageDiv.style.color = "green";
                } else {
                    messageDiv.textContent = `Error: ${result.message}`;
                    messageDiv.style.color = "red";
                }
            } catch (error) {
                messageDiv.textContent = `Error: ${error.message}`;
                messageDiv.style.color = "red";
            }
        });
    </script>
</body>
</html>
