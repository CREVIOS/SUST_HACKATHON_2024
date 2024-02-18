# SUST_HACKATHON_2024
 ### Not_An_AI built using ssh2, socket.io, xterm.js, express and Vue js

A bare bones example of an HTML5 web-based terminal emulator and SSH client. We use SSH2 as a client on a host to proxy a Websocket / Socket.io connection to a SSH2 server. Then we build a chatbot with vue js and connect it with the openai api so that all the input and output go directly to the chatbot and explain about them if there is any potential error or others.

#### HTML5 Web-Based Terminal Emulator and SSH Client:
Employ xterm.js for a robust terminal experience within the browser.
Utilize socket.io for real-time, bidirectional communication between the client and server.
Use ssh2 as the client-side library to establish secure SSH connections to the server.
#### Vue.js OpenAI Powered Chatbot:
Implement a Vue.js component for the chatbot interface, ensuring seamless integration with the terminal emulator.
Integrate the OpenAI API to power the chatbot's responses and provide informative explanations.
Design the chatbot to handle both user input and terminal output, offering guidance and error interpretation.
####  Express.js Server:
Act as the server-side component, managing socket.io connections and proxying SSH communication.
Integrate with an SSH2 server to facilitate secure connections from the client.
Key Functionalities:

####  Secure SSH Connections:
Employ ssh2 library for client-side authentication and secure data transmission.
Allow users to specify server details (hostname, port, username, password/key) for connection.
Handle different authentication methods (password, key-based) securely.
####  Real-Time Terminal Interaction:
Utilize xterm.js to provide a familiar terminal-like experience within the browser.
Enable users to send commands and interact with the SSH server in real time.
Display terminal output clearly and efficiently, incorporating styling and formatting as needed.
####  AI-Powered Chatbot Assistance:
Offer guidance and explanations as users interact with the terminal.
Use the OpenAI API to generate meaningful responses based on user input and terminal output.
Identify and explain potential errors or issues encountered during the SSH session.
Provide context-aware assistance, adapting to the user's current actions and goals.
####  User-Friendly Interface:
Design an intuitive interface that combines the terminal emulator and chatbot seamlessly.
Allow users to easily switch between terminal interaction and chatbot assistance.
Provide clear visual cues and feedback for actions and responses.
Offer customization options for terminal appearance and chatbot behavior.
Additional Considerations:

####  Security:
Strictly enforce HTTPS for all communication to protect user data.
Implement proper authentication and authorization mechanisms on both the client and server.
Securely store and manage user credentials (if using password authentication).
####  Scalability:
Design the architecture to handle multiple concurrent users and connections effectively.
Consider using load balancers and distributed systems if necessary.
####  Offline Functionality:
Explore ways to provide limited functionality or store commands for execution when online.
Consider caching recent terminal output for quick reference even when offline.
####  Accessibility:
Ensure the interface is usable by people with disabilities, adhering to WCAG guidelines.
Provide alternative input methods (e.g., voice commands) for users with limited motor skills.

# Build Details

### Backend
- cd backend and npm install --production. If you want to develop and rebuild javascript and other files utilize npm install instead.

- If desired, edit app/config.json to change the listener to your liking. There are also some default options which may be definied for a few of the variables.

- Run `npm start`

- Fire up a browser, navigate to IP/port of your choice and specify a host (https isn't used here because it's assumed it will be off-loaded to some sort of proxy):http://localhost:2222/ssh/host/127.0.0.1

- You will be prompted for credentials to use on the SSH server via HTTP Basic authentcaiton. This is to permit usage with some SSO systems that can replay credentials over HTTP basic.
