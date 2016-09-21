// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

using UnityEngine;
using System.Net.Sockets;
using Leap;

[RequireComponent(typeof(Collider))]
public class Teleport : MonoBehaviour, ICardboardGazeResponder
{
    private Vector3 startingPosition;
    private bool gazedAtGlobal;
    public GameObject leftCapsuleHand;
    public GameObject rightCapsuleHand;
    public Transform rightPalm;
    public Transform leftPalm;
    public Transform head;
    private Controller leapController;
    private bool isGrapped;
    private bool isZoomed;
    private float zoomRate;


    void Start()
    {
        gazedAtGlobal = false;
        startingPosition = transform.localPosition;
        SetGazedAt(false);
        leapController = new Controller();
        isGrapped = false;
        isZoomed = false;
        zoomRate = 0.0f;

        
    }




    void LateUpdate()
    {

        TextMesh textObject = GameObject.Find("txt_whichKey").GetComponent<TextMesh>();
        Cardboard.SDK.UpdateState();
        if (Cardboard.SDK.BackButtonPressed)
        {
            Application.Quit();
        }

        //Checks leap controller is connected and hands are visible in the scene
        if (leapController.IsConnected && leftCapsuleHand.activeSelf && rightCapsuleHand.activeSelf)
        {

            CheckZoomed();

            //Gestures without gazed to objects
            if (isZoomed)
            {

                //Track Position in Head object was removed

                Debug.Log("Zooming");
                textObject.text = "Zooming";
                head.transform.Translate(0, 0, 0.1f * zoomRate);
            }
            else
            {
                zoomRate = 0.0f;
                textObject.text = "No Gesture";
                Debug.Log("No Gesture");
            }

            //Focuses on Objects
            if (gazedAtGlobal)
            {
                CheckGrapped();

                //Gestures with gazed to objects
                if (isGrapped)
                {
                    Debug.Log("Grabbing");
                    textObject.text = "Grabbing";

                    //Important : Removed RigidBody from object !
                    transform.SetParent(rightPalm,true);

                }

                else
                {
                    transform.parent = null;

                }

            }
            else
            {
                CheckGrapped();
                if(!isGrapped)
                    transform.parent = null;

                textObject.text = "No Gesture";
                Debug.Log("No Gesture");
            }

        }
        else
        {
            transform.parent = null;
        }


        if (Input.GetKey(KeyCode.RightArrow) && gazedAtGlobal)
        {
            textObject.text = "Sağ";
            GetComponent<Renderer>().transform.Translate(0.01f, 0, 0);
        }
        if (Input.GetKey(KeyCode.LeftArrow) && gazedAtGlobal)
        {
            textObject.text = "Sol";
            GetComponent<Renderer>().transform.Translate(-0.01f, 0, 0);
        }
        if (Input.GetKey(KeyCode.UpArrow) && gazedAtGlobal)
        {
            textObject.text = "Yukarı";
            GetComponent<Renderer>().transform.Translate(0, 0.01f, 0);
        }
        if (Input.GetKey(KeyCode.DownArrow) && gazedAtGlobal)
        {
            textObject.text = "Aşağı";
            GetComponent<Renderer>().transform.Translate(0, -0.01f, 0);
        }
        if (Input.GetKey(KeyCode.Keypad8) && gazedAtGlobal)
        {
            textObject.text = "Zoom out";
            GetComponent<Renderer>().transform.Translate(0, 0, +0.01f);
        }
        if (Input.GetKey(KeyCode.Keypad2) && gazedAtGlobal)
        {
            textObject.text = "Zoom in";
            GetComponent<Renderer>().transform.Translate(0, 0, -0.01f);
        }

        if (Input.GetKey(KeyCode.R))
        {
            textObject.text = "Reset";
            transform.localPosition = startingPosition;
        }

        if (Input.GetKey(KeyCode.S))
        {
            textObject.text = getTextFromServerSocket();
        }


    }



    //Gesture Recognition-----------------------------------------------------------------

    /// <summary>
    /// Distance between index finger and palm, middle and palm, ring and palm, pinky and palm is lower than 0,07, this is grapped
    /// </summary>
    public void CheckGrapped()
    {
        GameObject r_index_3 = GameObject.FindWithTag("r_index_3");
        GameObject r_middle_3 = GameObject.FindWithTag("r_middle_3");
        GameObject r_ring_3 = GameObject.FindWithTag("r_ring_3");
        GameObject r_pinky_3 = GameObject.FindWithTag("r_pinky_3");

        if (Vector3.Distance(r_index_3.transform.position, rightPalm.position) < 0.07f
            && Vector3.Distance(r_middle_3.transform.position, rightPalm.position) < 0.07f
            && Vector3.Distance(r_ring_3.transform.position, rightPalm.position) < 0.07f
            && Vector3.Distance(r_pinky_3.transform.position, rightPalm.position) < 0.07f)
        {
            isGrapped = true;
        }
        else
            isGrapped = false;

    }

    /// <summary>
    /// If distance between right palm and left palm is smaller bigger than 0.2f, zoom the head.
    /// Always checks head is in boundaries, if you want to change boundary size, change 6.0
    /// y position is ignored.
    /// </summary>
    private void CheckZoomed()
    {
        zoomRate = Vector3.Distance(rightPalm.position, leftPalm.position);
        if (zoomRate > 0.2f)
        {
            if (head.position.x >= -6.0f && (head.position.x) <= 6.0f)
            {
                if ((head.position.z) >= -6.0f && (head.position.z) <= 6.0f)
                    isZoomed = true;
                else
                {
                    if(head.position.z < 0)
                        head.position = new Vector3(head.position.x, head.position.y, -6.0f);
                    else
                        head.position = new Vector3(head.position.x, head.position.y, 6.0f);

                    isZoomed = false;
                }

            }
            else
            {
                if(head.position.x < 0)
                    head.position = new Vector3(-6.0f, head.position.y, head.position.z);
                else
                    head.position = new Vector3(6.0f, head.position.y, head.position.z);

                isZoomed = false;
            }
        }
        else
        {

            isZoomed = false;
        }
    }


    //Gesture Recognition-----------------------------------------------------------------


    public void SetGazedAt(bool gazedAt)
    {
        gazedAtGlobal = gazedAt;
        GetComponent<Renderer>().material.color = gazedAt ? Color.green : Color.red;


        //if(gazedAt)
        //{
        //    GetComponent<Renderer>().transform.Translate(0, 0 , -5); 
        //}
        //else
        //{
        //    GetComponent<Renderer>().transform.Translate(0, 0, 5);
        //}

    }

    public void Reset()
    {
        transform.localPosition = startingPosition;
    }

    public void ToggleVRMode()
    {
        Cardboard.SDK.VRModeEnabled = !Cardboard.SDK.VRModeEnabled;
    }

    public void ToggleDistortionCorrection()
    {
        switch (Cardboard.SDK.DistortionCorrection)
        {
            case Cardboard.DistortionCorrectionMethod.Unity:
                Cardboard.SDK.DistortionCorrection = Cardboard.DistortionCorrectionMethod.Native;
                break;
            case Cardboard.DistortionCorrectionMethod.Native:
                Cardboard.SDK.DistortionCorrection = Cardboard.DistortionCorrectionMethod.None;
                break;
            case Cardboard.DistortionCorrectionMethod.None:
            default:
                Cardboard.SDK.DistortionCorrection = Cardboard.DistortionCorrectionMethod.Unity;
                break;
        }
    }

    public void ToggleDirectRender()
    {
        Cardboard.Controller.directRender = !Cardboard.Controller.directRender;
    }

    public void TeleportRandomly()
    {
        Vector3 direction = UnityEngine.Random.onUnitSphere;
        direction.y = Mathf.Clamp(direction.y, 0.5f, 1f);
        float distance = 2 * UnityEngine.Random.value + 1.5f;
        transform.localPosition = direction * distance;
    }

    #region ICardboardGazeResponder implementation

    /// Called when the user is looking on a GameObject with this script,
    /// as long as it is set to an appropriate layer (see CardboardGaze).
    public void OnGazeEnter()
    {
        SetGazedAt(true);
    }

    /// Called when the user stops looking on the GameObject, after OnGazeEnter
    /// was already called.
    public void OnGazeExit()
    {
        SetGazedAt(false);


    }

    // Called when the Cardboard trigger is used, between OnGazeEnter
    /// and OnGazeExit.
    public void OnGazeTrigger()
    {
        TeleportRandomly();
    }

    #endregion


    //Server'dan gelen string'i geri döndüren metod. Host: localhost, port: 8888
    //Net Socket kullanılmıştır. 
    public string getTextFromServerSocket()
    {
        System.Net.Sockets.TcpClient clientSocket = new System.Net.Sockets.TcpClient();
        clientSocket.Connect("127.0.0.1", 7777);

        NetworkStream serverStream = clientSocket.GetStream();

        byte[] inStream = new byte[1024];
        serverStream.Read(inStream, 0, inStream.Length);
        string returndata = System.Text.Encoding.ASCII.GetString(inStream);
        return returndata;
    }
}
