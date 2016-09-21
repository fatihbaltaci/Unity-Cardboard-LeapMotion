using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Net.Sockets;

public class Client : MonoBehaviour
{

    SocketFrame frame;
    TcpClient clientSocket;
    NetworkStream serverStream;
    byte[] inStream;


    // Use this for initialization
    void Start()
    {
        frame = new SocketFrame();

        clientSocket = new TcpClient();
        clientSocket.Connect("127.0.0.1", 6500);
        inStream = new byte[15000];



    }

    // Update is called once per frame
    void LateUpdate()
    {
       

        getFrameFromServerSocket();



    }


    public void getFrameFromServerSocket()
    {

        serverStream = clientSocket.GetStream();
       
        serverStream.Read(inStream, 0, inStream.Length);
        string json = System.Text.Encoding.ASCII.GetString(inStream);
        Debug.Log(json);
        //SocketFrame frame2 = JsonConvert.DeserializeObject<SocketFrame>(json);
        //return frame2;
    }
}

