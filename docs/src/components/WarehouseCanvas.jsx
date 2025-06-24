import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Transformer, Image, Line } from "react-konva";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backgroundImage1 from "../assets/Main_Individual.png";
import warehouseLayoutData1 from "../assets/Main_Individual_storage.json";

const WarehouseCanvas = () => {
    const [boxes, setBoxes] = useState(() => {
        const saved = localStorage.getItem("layout");
        const data = saved ? JSON.parse(saved) : warehouseLayoutData1;
        
        // Добавляем значения по умолчанию для произвольных форм
        return data.map(box => ({
            ...box,
            scaleX: box.scaleX || 1,
            scaleY: box.scaleY || 1
        }));
    });

    const [selectedId, setSelectedId] = useState(null);
    const [backgroundImg, setBackgroundImg] = useState(null);
    const trRef = useRef();
    const shapeRefs = useRef({});

    // Загрузка фонового изображения
    useEffect(() => {
        const img = new window.Image();
        img.src = backgroundImage1;
        img.onload = () => {
            setBackgroundImg(img);
        };
    }, []);

    const handleClick = (name) => {
        setSelectedId(name);
    };

    const handleDragEnd = (e, index) => {
        const newBoxes = [...boxes];
        newBoxes[index] = {
            ...newBoxes[index],
            x: e.target.x(),
            y: e.target.y(),
        };
        setBoxes(newBoxes);
        localStorage.setItem("layout", JSON.stringify(newBoxes));
        toast.success("Положение ячейки сохранено");
    };

    const handleTransformEnd = (e, index) => {
        const node = e.target;
        const newBoxes = [...boxes];
        const box = newBoxes[index];
        
        if (box.type && box.points) {
            // Для произвольных форм обновляем только позицию и масштаб
            newBoxes[index] = {
                ...box,
                x: node.x(),
                y: node.y(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
            };
        } else {
            // Для прямоугольных форм
            newBoxes[index] = {
                ...box,
                x: node.x(),
                y: node.y(),
                width: Math.max(20, node.width() * node.scaleX()),
                height: Math.max(20, node.height() * node.scaleY()),
            };
            // Сброс масштабов (scale) после трансформации
            node.scaleX(1);
            node.scaleY(1);
        }

        setBoxes(newBoxes);
        localStorage.setItem("layout", JSON.stringify(newBoxes));
        toast.success("Размер ячейки обновлён");
    };

    const handleSave = () => {
        localStorage.setItem("layout", JSON.stringify(boxes));
        toast.success("Схема вручную сохранена!");
    };

    useEffect(() => {
        if (trRef.current && selectedId && shapeRefs.current[selectedId]) {
            trRef.current.nodes([shapeRefs.current[selectedId]]);
            trRef.current.getLayer().batchDraw();
        }
    }, [selectedId, boxes]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Stage width={1280} height={751}>
                <Layer>
                    {/* Фоновое изображение */}
                    {backgroundImg && (
                        <Image
                            image={backgroundImg}
                            x={0}
                            y={0}
                            width={1280}
                            height={751}
                            listening={false}
                        />
                    )}
                    
                    {boxes.map((box, index) => (
                    <React.Fragment key={box.name}>
                        {box.type && box.points ? (
                            // Произвольная форма
                            <Line
                                ref={(node) => (shapeRefs.current[box.name] = node)}
                                x={box.x}
                                y={box.y}
                                points={box.points}
                                scaleX={box.scaleX || 1}
                                scaleY={box.scaleY || 1}
                                fill={
                                    selectedId === box.name
                                        ? "rgba(0, 123, 255, 0.4)"
                                        : "rgba(255,255,255,0.2)"
                                }
                                stroke="black"
                                strokeWidth={1}
                                closed={true}
                                draggable
                                onClick={() => handleClick(box.name)}
                                onDragEnd={(e) => handleDragEnd(e, index)}
                                onTransformEnd={(e) => handleTransformEnd(e, index)}
                            />
                        ) : (
                            // Прямоугольная форма
                            <Rect
                                ref={(node) => (shapeRefs.current[box.name] = node)}
                                x={box.x}
                                y={box.y}
                                width={box.width}
                                height={box.height}
                                fill={
                                    selectedId === box.name
                                        ? "rgba(0, 123, 255, 0.4)"
                                        : "rgba(255,255,255,0.2)"
                                }
                                stroke="black"
                                draggable
                                onClick={() => handleClick(box.name)}
                                onDragEnd={(e) => handleDragEnd(e, index)}
                                onTransformEnd={(e) => handleTransformEnd(e, index)}
                            />
                        )}
                        <Text
                            text={box.name}
                            x={box.x + box.width / 2}
                            y={box.y + box.height / 2}
                            fontSize={14}
                            fill="black"
                            align="center"
                            verticalAlign="middle"
                            offsetX={0}
                            offsetY={7}
                        />
                    </React.Fragment>
                ))}

                                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            // Ограничение минимального размера
                            if (newBox.width < 20 || newBox.height < 20) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                        anchorSize={8}
                        rotateEnabled={false}
                    />
                </Layer>
            </Stage>

            <div style={{ width: 300, marginTop: 20 }}>
                {selectedId ? (
                    <>
                        <h3 style={{color: "black", fontSize: "18px"}}>{selectedId}</h3>
                        {(() => {
                            const selectedBox = boxes.find((b) => b.name === selectedId);
                            return (
                                <>
                                    {selectedBox?.type && (
                                        <p style={{fontSize: "18px", color: "black"}}>
                                            <strong style={{color: "black", fontSize: "18px"}}>Тип:</strong>{" "}
                                            {selectedBox.type === "L_SHAPE" ? "L-образная" : 
                                             selectedBox.type === "CUSTOM_POLYGON" ? "Произвольная" : 
                                             "Прямоугольная"}
                                        </p>
                                    )}
                                    <p style={{fontSize: "18px", color: "black"}}>
                                        <strong style={{color: "black", fontSize: "18px"}}>Ширина:</strong>{" "}
                                        {selectedBox?.width}px
                                    </p>
                                    <p style={{fontSize: "18px", color: "black"}}>
                                        <strong style={{color: "black", fontSize: "18px"}}>Высота:</strong>{" "}
                                        {selectedBox?.height}px
                                    </p>
                                    {selectedBox?.scaleX && selectedBox?.scaleY && (
                                        <p style={{fontSize: "18px", color: "black"}}>
                                            <strong style={{color: "black", fontSize: "18px"}}>Масштаб:</strong>{" "}
                                            X: {selectedBox.scaleX.toFixed(2)}, Y: {selectedBox.scaleY.toFixed(2)}
                                        </p>
                                    )}
                                    <p style={{fontSize: "18px", color: "black"}}>
                                        <strong style={{color: "black", fontSize: "18px"}}>Площадь:</strong>{" "}
                                        {(
                                            (selectedBox?.width || 0) *
                                            (selectedBox?.height || 0) *
                                            (selectedBox?.scaleX || 1) *
                                            (selectedBox?.scaleY || 1)
                                        ).toFixed(0)}{" "}
                                        px²
                                    </p>
                                </>
                            );
                        })()}
                    </>
                ) : (
                    <p>Нажмите на ячейку</p>
                )}

                <button
                    onClick={handleSave}
                    style={{
                        marginTop: 20,
                        padding: "10px 20px",
                        background: "#007bff",
                        color: "#030303",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                    }}
                >
                    Сохранить схему
                </button>
            </div>
        </div>
    );
};

export default WarehouseCanvas;