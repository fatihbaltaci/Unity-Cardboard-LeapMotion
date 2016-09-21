
using System.Collections.Generic;

public class Gestures
{
    public string left { get; set; }
    public string right { get; set; }
}

public class Hand
{
    public List<List<double>> armBasis { get; set; }
    public double armWidth { get; set; }
    public int confidence { get; set; }
    public List<double> direction { get; set; }
    public List<double> elbow { get; set; }
    public double grabAngle { get; set; }
    public int grabStrength { get; set; }
    public int id { get; set; }
    public List<double> palmNormal { get; set; }
    public List<double> palmPosition { get; set; }
    public List<double> palmVelocity { get; set; }
    public double palmWidth { get; set; }
    public double pinchDistance { get; set; }
    public int pinchStrength { get; set; }
    public List<List<double>> r { get; set; }
    public double s { get; set; }
    public List<double> sphereCenter { get; set; }
    public double sphereRadius { get; set; }
    public List<double> stabilizedPalmPosition { get; set; }
    public List<double> t { get; set; }
    public double timeVisible { get; set; }
    public string type { get; set; }
    public List<double> wrist { get; set; }
}

public class InteractionBox
{
    public List<int> center { get; set; }
    public List<double> size { get; set; }
}

public class Pointable
{
    public List<List<List<double>>> bases { get; set; }
    public List<double> btipPosition { get; set; }
    public List<double> carpPosition { get; set; }
    public List<double> dipPosition { get; set; }
    public List<double> direction { get; set; }
    public bool extended { get; set; }
    public int handId { get; set; }
    public int id { get; set; }
    public double length { get; set; }
    public List<double> mcpPosition { get; set; }
    public List<double> pipPosition { get; set; }
    public List<double> stabilizedTipPosition { get; set; }
    public double timeVisible { get; set; }
    public List<double> tipPosition { get; set; }
    public List<double> tipVelocity { get; set; }
    public bool tool { get; set; }
    public double touchDistance { get; set; }
    public string touchZone { get; set; }
    public int type { get; set; }
    public double width { get; set; }
}

public class SocketFrame
{
    public double currentFrameRate { get; set; }
    public List<object> devices { get; set; }
    public Gestures gestures { get; set; }
    public List<Hand> hands { get; set; }
    public int id { get; set; }
    public InteractionBox interactionBox { get; set; }
    public List<Pointable> pointables { get; set; }
    public List<List<double>> r { get; set; }
    public double s { get; set; }
    public List<double> t { get; set; }
    public long timestamp { get; set; }
}
