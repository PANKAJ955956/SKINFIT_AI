import pytest
from app.ai.body.analyzer import body_analyzer


def test_bmi_normal_calculation():
    # 175 cm, 70 kg -> 70 / (1.75^2) = 22.86 -> 22.9
    res = body_analyzer.calculate_bmi(height_cm=175.0, weight_kg=70.0, age=25, gender="male")
    assert res["bmi"] == 22.9
    assert res["category"] == "normal_weight"
    assert res["healthy_weight_range_kg"]["min"] == pytest.approx(56.7, 0.2)
    assert res["healthy_weight_range_kg"]["max"] == pytest.approx(76.3, 0.2)
    assert len(res["safeguards"]) == 0
    assert res["bmr_calories_est"] is not None


def test_bmi_underweight_safeguard():
    # 170 cm, 45 kg -> 45 / (1.7^2) = 15.6 (underweight)
    res = body_analyzer.calculate_bmi(height_cm=170.0, weight_kg=45.0, age=22, gender="female")
    assert res["category"] == "underweight"
    assert any("underweight" in s.lower() for s in res["safeguards"])


def test_bmi_minor_safeguard():
    res = body_analyzer.calculate_bmi(height_cm=160.0, weight_kg=60.0, age=16, gender="female")
    assert any("under 18" in s.lower() for s in res["safeguards"])


def test_invalid_bmi_inputs():
    with pytest.raises(ValueError):
        body_analyzer.calculate_bmi(height_cm=-10.0, weight_kg=70.0)
