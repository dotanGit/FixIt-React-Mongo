import { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import defaultAvatarImg from '../assets/avatar.png'
import { faImage } from '@fortawesome/free-solid-svg-icons'

interface ImageUploadFieldProps {
    currentImage?: string
    onImageChange: (file: File | null) => void
    shape?: 'circle' | 'square'
    defaultImage?: string
}

const ImageUploadField = ({ 
    currentImage, 
    onImageChange, 
    shape = 'square',
    defaultImage = defaultAvatarImg
}: ImageUploadFieldProps) => {
    const [preview, setPreview] = useState<string | null>(currentImage || null)
    const inputFileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setPreview(currentImage || null)
    }, [currentImage])

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                alert('File size exceeds the 5MB limit. Please choose a smaller image.')
                event.target.value = ''
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            onImageChange(file)
        }
    }

    const handleClick = () => {
        inputFileRef.current?.click()
    }

    if (shape === 'circle') {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '12px',
                marginBottom: '10px'
            }}>
                <div style={{ position: 'relative' }}>
                    <img
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #e2e8f0',
                            backgroundColor: '#f7fafc',
                            cursor: 'pointer'
                        }}
                        src={preview || defaultImage}
                        alt="Profile avatar"
                        onClick={handleClick}
                        onError={(e) => {
                            e.currentTarget.src = defaultImage
                        }}
                    />
                    <div 
                        style={{ 
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            backgroundColor: '#3182ce',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '3px solid #ffffff',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={handleClick}
                    >
                        <FontAwesomeIcon 
                            icon={faImage} 
                            style={{ color: '#ffffff', fontSize: '16px' }}
                        />
                    </div>
                </div>
                <p style={{ 
                    fontSize: '13px', 
                    color: '#718096',
                    margin: '0'
                }}>Click the icon to upload profile picture</p>
                <input 
                    ref={inputFileRef}
                    type="file" 
                    accept='image/png, image/jpeg' 
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
        )
    }

    // Square shape
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '12px',
            marginBottom: '10px'
        }}>
            {preview ? (
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <img 
                        style={{ 
                            width: '100%', 
                            height: '250px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '2px solid #e2e8f0',
                        }}
                        src={preview}
                        alt="Image preview"
                    />
                    <div 
                        style={{ 
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#3182ce',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '3px solid #ffffff',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={handleClick}
                    >
                        <FontAwesomeIcon 
                            icon={faImage} 
                            style={{ color: '#ffffff', fontSize: '16px' }}
                        />
                    </div>
                </div>
            ) : (
                <div 
                    onClick={handleClick}
                    style={{ 
                        width: '100%',
                        height: '150px',
                        border: '2px dashed #cbd5e0',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f7fafc',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3182ce'
                        e.currentTarget.style.backgroundColor = '#ebf8ff'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e0'
                        e.currentTarget.style.backgroundColor = '#f7fafc'
                    }}
                >
                    <FontAwesomeIcon 
                        icon={faImage} 
                        style={{ color: '#a0aec0', fontSize: '36px', marginBottom: '8px' }}
                    />
                    <p style={{ 
                        fontSize: '14px', 
                        color: '#718096',
                        margin: '0'
                    }}>Click to upload an image (optional)</p>
                </div>
            )}
            <input 
                ref={inputFileRef}
                type="file" 
                accept='image/png, image/jpeg' 
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    )
}

export default ImageUploadField
