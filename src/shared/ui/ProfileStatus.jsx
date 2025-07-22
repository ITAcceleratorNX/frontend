import { useProfileCheck } from '../lib/hooks/useProfileCheck';
import { CheckCircle, AlertCircle, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const ProfileStatus = ({ 
  showDetails = false, 
  className = "",
  variant = "default" // "default", "compact", "badge"
}) => {
  const { profileValidation, isProfileComplete, user } = useProfileCheck();
  const navigate = useNavigate();

  if (!user) return null;

  // Компактный вариант - только бейдж
  if (variant === "badge") {
    return (
      <Badge 
        variant={isProfileComplete ? "success" : "destructive"}
        className={className}
      >
        {isProfileComplete ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Профиль заполнен
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 mr-1" />
            Заполните профиль
          </>
        )}
      </Badge>
    );
  }

  // Компактный вариант
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isProfileComplete ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Профиль заполнен</span>
          </div>
        ) : (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Заполните профиль</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/personal-account')}
              className="ml-2"
            >
              Заполнить
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Полный вариант с деталями
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Статус профиля
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isProfileComplete ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Профиль заполнен полностью</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-amber-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Профиль заполнен не полностью</span>
              </div>
              
              {showDetails && profileValidation && (
                <div className="space-y-2">
                  {profileValidation.missingFields.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Не заполнены:</p>
                      <ul className="list-disc list-inside ml-2">
                        {profileValidation.missingFields.map((field, index) => (
                          <li key={index}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {profileValidation.invalidFields?.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Некорректно заполнены:</p>
                      <ul className="list-disc list-inside ml-2">
                        {profileValidation.invalidFields.map((field, index) => (
                          <li key={index}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                onClick={() => navigate('/personal-account')}
                className="w-full"
              >
                Заполнить профиль
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};