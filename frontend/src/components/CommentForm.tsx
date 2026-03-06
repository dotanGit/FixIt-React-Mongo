import { useForm } from 'react-hook-form'

interface CommentFormData {
    message: string
}

interface CommentFormProps {
    onSubmit: (message: string) => void
    isSubmitting?: boolean
}

const CommentForm = ({ onSubmit, isSubmitting = false }: CommentFormProps) => {
    const { register, handleSubmit, reset } = useForm<CommentFormData>()

    const handleFormSubmit = (data: CommentFormData) => {
        onSubmit(data.message)
        reset()
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
            <textarea 
                {...register("message", { required: true })} 
                placeholder="Add a comment..."
                rows={3}
                disabled={isSubmitting}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    marginBottom: '12px',
                    opacity: isSubmitting ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
            />
            <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    backgroundColor: isSubmitting ? '#a0aec0' : '#3182ce',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                    if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#2c5aa0'
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#3182ce'
                    }
                }}
            >
                {isSubmitting ? 'Adding...' : 'Add Comment'}
            </button>
        </form>
    )
}

export default CommentForm
