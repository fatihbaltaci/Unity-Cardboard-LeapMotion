using UnityEngine;
using System.Collections;

public class GrabObjects : MonoBehaviour {

    // Use this for initialization
    public Transform palmLocation;

	void Start () {
	    
	}
	
	// Update is called once per frame
	void Update () {
        Vector3 correction = new Vector3(0, 0, 1f);
        transform.position = palmLocation.position + correction;
        //transform.rotation = palmLocation.rotation;

	}
}
